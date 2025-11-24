import {useLocation} from "react-router";
import ReactMarkdown from "react-markdown";
import Navbar from "~/components/Navbar";
import remarkGfm from "remark-gfm";

const SkillStudy = () => {
    const location = useLocation();
    const studyPlan = location.state?.studyPlan || "No study plan available.";

    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6">
            <Navbar />

            <div className="max-w-6xl mx-auto mt-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-700 mb-2 drop-shadow-sm">
                        Recommended Study Roadmap
                    </h1>
                    <p className="text-blue-500 text-lg">
                        Based on your skill assessment
                    </p>
                </div>

                {/* Content Card */}
                <div
                    className="
            bg-white
            shadow-lg
            rounded-2xl
            p-8
            border border-blue-100
            backdrop-blur-xl
        "
                >
                    <div className="max-w-5xl mx-auto bg-white rounded-2xl p-8">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({node, ...props}) => (
                                    <h1 className="text-3xl font-bold text-blue-700 my-6" {...props} />
                                ),
                                h2: ({node, ...props}) => (
                                    <h2 className="text-2xl font-semibold text-blue-600 my-5" {...props} />
                                ),
                                h3: ({node, ...props}) => (
                                    <h3 className="text-xl font-semibold text-blue-500 my-4" {...props} />
                                ),
                                p: ({node, ...props}) => (
                                    <p className="text-blue-800 text-base leading-relaxed mb-4" {...props} />
                                ),
                                li: ({node, ...props}) => (
                                    <li className="text-blue-800 leading-relaxed mb-2 list-disc ml-6" {...props} />
                                ),
                                table: ({node, ...props}) => (
                                    <table className="table-auto border-collapse border border-blue-200 my-4" {...props} />
                                ),
                                th: ({node, ...props}) => (
                                    <th className="border border-blue-300 px-4 py-2 bg-blue-50 text-left" {...props} />
                                ),
                                td: ({node, ...props}) => (
                                    <td className="border border-blue-300 px-4 py-2" {...props} />
                                ),
                            }}
                        >
                            {studyPlan}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-10 text-blue-500">
                    <p className="text-sm">AI-generated learning plan tailored for your skills.</p>
                </div>

            </div>

        </main>
    );
};

export default SkillStudy;
