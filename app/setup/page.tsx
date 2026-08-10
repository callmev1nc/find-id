export default function SetupPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          border: "1px solid #e3e5e8",
          borderRadius: 12,
          padding: 32,
          boxShadow: "0 8px 30px rgba(0,0,0,.06)",
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>Setup required</h1>
        <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.6 }}>
          The <code>APP_PASSWORD</code> environment variable is not set. Add it
          to your deployment (on Vercel:{" "}
          <em>Settings → Environment Variables</em>) with the team password,
          then reload this page.
        </p>
      </div>
    </main>
  );
}
