import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || "";
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no svix headers, this is not a Clerk webhook event
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_SECRET_KEY || "";

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    const wh = new Webhook(webhookSecret);
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  // Handle the webhook event
  const eventType = evt.type;

  console.log(`Webhook event received: ${eventType}`);

  if (eventType === "user.created") {
    // A new user was created in Clerk
    const { id, phone_numbers, email_addresses, username } = evt.data;

    try {
      // Default to user role
      const role = "user";

      // Extract phone number if available
      const phoneNumber =
        phone_numbers && phone_numbers.length > 0
          ? phone_numbers[0].phone_number
          : null;

      // Extract email if available
      const email =
        email_addresses && email_addresses.length > 0
          ? email_addresses[0].email_address
          : null;

      // Insert user into Supabase
      const { data, error } = await supabase.from("users").insert({
        id,
        phone_number: phoneNumber,
        email: email,
        username: username || null,
        role,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error inserting user into Supabase:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else if (eventType === "user.updated") {
    // User was updated in Clerk
    const { id, phone_numbers, email_addresses, username } = evt.data;

    try {
      // Extract phone number if available
      const phoneNumber =
        phone_numbers && phone_numbers.length > 0
          ? phone_numbers[0].phone_number
          : null;

      // Extract email if available
      const email =
        email_addresses && email_addresses.length > 0
          ? email_addresses[0].email_address
          : null;

      // Update user in Supabase
      const { data, error } = await supabase
        .from("users")
        .update({
          phone_number: phoneNumber,
          email: email,
          username: username || null,
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating user in Supabase:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else if (eventType === "user.deleted") {
    // User was deleted in Clerk
    const { id } = evt.data;

    try {
      // We don't actually delete the user from Supabase for data integrity
      // Instead, we could mark them as inactive or implement soft delete

      // If you want to actually delete the user, uncomment this:
      /*
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting user from Supabase:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      */

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Return a 200 response for other event types
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
