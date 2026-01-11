import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderPayload {
  type: "INSERT";
  table: "orders";
  record: {
    id: string;
    order_number: string;
    customer_name: string;
    total: number;
    status: string;
  };
  schema: "public";
}

interface FCMMessage {
  message: {
    token: string;
    notification: {
      title: string;
      body: string;
    };
    data: {
      type: string;
      orderId: string;
      orderNumber: string;
    };
    android: {
      priority: "high";
      notification: {
        channel_id: string;
        priority: "high";
        default_vibrate_timings: boolean;
      };
    };
    apns: {
      payload: {
        aps: {
          sound: string;
          badge: number;
        };
      };
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: OrderPayload = await req.json();

    // Only process new order inserts
    if (payload.type !== "INSERT" || payload.table !== "orders") {
      return new Response(
        JSON.stringify({ message: "Not a new order insert" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = payload.record;
    console.log("Processing new order:", order.order_number);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Firebase credentials
    const firebaseProjectId = Deno.env.get("FIREBASE_PROJECT_ID")!;
    const firebaseClientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL")!;
    const firebasePrivateKey = Deno.env
      .get("FIREBASE_PRIVATE_KEY")!
      .replace(/\\n/g, "\n");

    // Get OAuth2 access token for Firebase
    const accessToken = await getFirebaseAccessToken(
      firebaseClientEmail,
      firebasePrivateKey
    );

    // Fetch all device tokens
    const { data: deviceTokens, error: tokensError } = await supabase
      .from("device_tokens")
      .select("token, platform");

    if (tokensError) {
      throw new Error(`Failed to fetch device tokens: ${tokensError.message}`);
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      console.log("No device tokens registered");
      return new Response(
        JSON.stringify({ message: "No devices to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send notifications to all devices
    const results = await Promise.allSettled(
      deviceTokens.map(async (device) => {
        const fcmMessage: FCMMessage = {
          message: {
            token: device.token,
            notification: {
              title: `New Order: ${order.order_number}`,
              body: `${order.customer_name} - ₹${order.total}`,
            },
            data: {
              type: "new_order",
              orderId: order.id,
              orderNumber: order.order_number,
            },
            android: {
              priority: "high",
              notification: {
                channel_id: "orders",
                priority: "high",
                default_vibrate_timings: true,
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: "default",
                  badge: 1,
                },
              },
            },
          },
        };

        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/${firebaseProjectId}/messages:send`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(fcmMessage),
          }
        );

        if (!response.ok) {
          const errorBody = await response.text();

          // Handle invalid/expired tokens
          if (response.status === 404 || errorBody.includes("UNREGISTERED")) {
            // Remove invalid token
            await supabase
              .from("device_tokens")
              .delete()
              .eq("token", device.token);
            console.log(
              "Removed invalid token:",
              device.token.substring(0, 20)
            );
          }

          throw new Error(`FCM error: ${errorBody}`);
        }

        return response.json();
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`Notifications sent: ${succeeded} succeeded, ${failed} failed`);

    return new Response(
      JSON.stringify({
        message: "Notifications processed",
        succeeded,
        failed,
        total: deviceTokens.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Get Firebase access token using service account credentials
 */
async function getFirebaseAccessToken(
  clientEmail: string,
  privateKey: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: expiry,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  // Create JWT
  const headerB64 = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const signatureInput = `${headerB64}.${payloadB64}`;

  // Import private key
  const pemContents = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign the JWT
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signatureInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${headerB64}.${payloadB64}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}
