/// <reference lib="webworker" />

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || "",
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      data: data.data ? JSON.parse(data.data) : {},
      tag: data.data?.conversationId || "default",
      renotify: true,
      actions: [
        { action: "open", title: "Open" },
        { action: "dismiss", title: "Dismiss" },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "ExoChat", options)
    );
  } catch {
    // Fallback for non-JSON payloads
    event.waitUntil(
      self.registration.showNotification("ExoChat", {
        body: event.data.text(),
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const data = event.notification.data || {};
  const conversationId = data.conversationId;
  const url = conversationId ? `/chat/${conversationId}` : "/chat";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Try to focus an existing window
      for (const client of clients) {
        if (client.url.includes("/chat") && "focus" in client) {
          client.focus();
          if (conversationId) {
            client.navigate(url);
          }
          return;
        }
      }
      // Open a new window
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  // Re-subscribe if the subscription changes
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((subscription) => {
        // Send the new subscription to the server
        return fetch("/api/v1/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dhKey: btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey("p256dh"))
              )
            ),
            authKey: btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey("auth"))
              )
            ),
          }),
        });
      })
  );
});
