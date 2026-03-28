import { useNavigate } from "react-router-dom"
import { ShieldOff, ArrowLeft } from "lucide-react"

function Unauthorized() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6
                        bg-slate-900 [html:not(.dark)_&]:bg-slate-50">
            <div className="flex flex-col items-center text-center max-w-sm"
                style={{ animation: "fadeUp 0.4s ease both" }}>

                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20
                                flex items-center justify-center mb-6">
                    <ShieldOff size={36} className="text-red-400" />
                </div>

                {/* Text */}
                <h1 className="text-3xl font-bold tracking-tight mb-2
                               text-slate-100 [html:not(.dark)_&]:text-slate-900">
                    Unauthorized
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                    You don't have permission to access this page.
                    Contact your administrator if you think this is a mistake.
                </p>

                {/* Actions */}
                <div className="flex gap-3 mt-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                                   border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500
                                   [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:text-slate-500
                                   [html:not(.dark)_&]:hover:border-slate-400 [html:not(.dark)_&]:hover:text-slate-700
                                   transition-all"
                    >
                        <ArrowLeft size={15} /> Go Back
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="px-4 py-2.5 rounded-lg text-sm font-medium
                                   bg-sky-500 text-white hover:bg-sky-400 hover:-translate-y-0.5
                                   transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

export default Unauthorized