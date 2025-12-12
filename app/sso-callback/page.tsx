export default function SSOCallback() {
  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen py-12 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">SSO Callback</h1>
        <p className="text-muted-foreground">
          Processing authentication...
        </p>
      </div>
    </div>
  );
}
