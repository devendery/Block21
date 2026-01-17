import { NextResponse } from "next/server";
import { loadChatState, saveChatState, StoredChatState } from "@/lib/gameDb";

export const runtime = "nodejs";

export async function GET() {
  const state = await loadChatState();
  return NextResponse.json(state, { status: 200 });
}

type ActionBody =
  | { action: "getState" }
  | { action: "sendFriendRequest" }
  | { action: "acceptFriendRequest" }
  | { action: "block" }
  | { action: "unblock" }
  | { action: "report" }
  | { action: "sendMessage"; text: string };

export async function POST(request: Request) {
  let body: ActionBody;
  try {
    body = (await request.json()) as ActionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let state: StoredChatState = await loadChatState();

  switch (body.action) {
    case "getState":
      return NextResponse.json(state, { status: 200 });
    case "sendFriendRequest":
      if (state.relationship === "none" || state.relationship === "blocked") {
        state = {
          ...state,
          relationship: "pending",
          hasReported: false,
        };
      }
      break;
    case "acceptFriendRequest":
      if (state.relationship === "pending") {
        state = {
          ...state,
          relationship: "friends",
        };
      }
      break;
    case "block":
      state = {
        relationship: "blocked",
        messages: [],
        hasReported: state.hasReported,
      };
      break;
    case "unblock":
      state = {
        relationship: "none",
        messages: [],
        hasReported: false,
      };
      break;
    case "report":
      state = {
        ...state,
        hasReported: true,
      };
      break;
    case "sendMessage":
      if (state.relationship !== "friends") {
        return NextResponse.json(
          { error: "Chat is only available between friends" },
          { status: 403 }
        );
      }
      if (!body.text || typeof body.text !== "string") {
        return NextResponse.json(
          { error: "Message text is required" },
          { status: 400 }
        );
      }
      {
        const trimmed = body.text.trim();
        if (!trimmed) {
          return NextResponse.json(
            { error: "Message text is empty" },
            { status: 400 }
          );
        }
        const now = new Date();
        const time = now.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
        const nextId =
          (state.messages[state.messages.length - 1]?.id ?? 0) + 1;
        state = {
          ...state,
          messages: [
            ...state.messages,
            { id: nextId, from: "you", text: trimmed, createdAt: time },
          ],
        };
      }
      break;
    default:
      return NextResponse.json(
        { error: "Unknown action" },
        { status: 400 }
      );
  }

  await saveChatState(state);
  return NextResponse.json(state, { status: 200 });
}
