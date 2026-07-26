export async function sendNotification(
  type: "project" | "section" | "message",
  title: string,
  description: string,
  projectId?: string,
  projectImage?: string,
  projectCategory?: string
) {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title,
        description,
        projectId,
        projectImage,
        projectCategory,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorBody: string | Record<string, unknown> = text;
      try {
        errorBody = JSON.parse(text);
      } catch {
        errorBody = text || response.statusText;
      }
      console.error("Notification API error:", errorBody);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return false;
  }
}
