function Unauthorized() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 font-mono">
            {/* Subtle grid background */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Glow blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-red-700/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card */}
            <div className="relative z-10 border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-10 max-w-md w-full">
                {/* Top status bar */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800 text-xs text-zinc-600 uppercase tracking-widest">
                    <span>sys:access</span>
                    <span className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        denied
                    </span>
                </div>

                {/* Error code */}
                <p className="text-[5rem] font-bold leading-none text-zinc-800 select-none mb-2">
                    401
                </p>

                {/* Heading */}
                <h1 className="text-2xl font-semibold text-red-500 uppercase tracking-widest mb-3">
                    Unauthorized
                </h1>

                {/* Message */}
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                    You do not have permission to access this page. If you believe
                    this is an error, please contact your system administrator.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="flex-1 px-4 py-2.5 text-xs uppercase tracking-widest text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-colors duration-200"
                    >
                        ← Go Back
                    </button>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="flex-1 px-4 py-2.5 text-xs uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white transition-colors duration-200"
                    >
                        Home
                    </button>
                </div>

                {/* Footer */}
                <p className="mt-6 text-[10px] text-zinc-700 uppercase tracking-widest">
                    timestamp: {new Date().toISOString()}
                </p>
            </div>
        </div>
    );
}

export default Unauthorized;