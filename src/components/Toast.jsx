export default function Toast({ toast }) {
  return (
    <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
      {toast && (
        <>
          <i className={`fa-solid ${toast.icon}`} />
          {toast.message}
        </>
      )}
    </div>
  );
}
