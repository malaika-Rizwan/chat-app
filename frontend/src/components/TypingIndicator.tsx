export function TypingIndicator({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="px-4 py-2 text-sm text-gray-500">
      <span className="animate-pulse">Typing...</span>
    </div>
  );
}
