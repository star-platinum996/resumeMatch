import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";
import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { usePuterStore } from "~/lib/puter";

const Category = ({ title, score }: { title: string, score: number }) => {
    const textColor = score > 70 ? 'text-green-600'
        : score > 49
            ? 'text-yellow-600'
            : 'text-red-600';

    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row gap-2 items-center justify-center">
                    <p className="text-2xl">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-2xl">
                    <span className={textColor}>{score}</span>/100
                </p>
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: Feedback }) => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { ai, kv } = usePuterStore();

    const [loading, setLoading] = useState(false); // ✅ 新增状态控制加载

    const handleRecommendStudy = async () => {
        if (!feedback?.skills || !id) return;

        setLoading(true);

        const kvKey = `${id}_plan`;

        try {
            const cachedPlan = await kv.get(kvKey);
            if (cachedPlan) {
                navigate("/skillstudy", { state: { studyPlan: cachedPlan } });
                setLoading(false);
                return;
            }

            const prompt = `
You are a career skills planning assistant. Generate a structured learning roadmap (in markdown format) based on the following skills that users lack or need to improve:
- Core skills
- Recommended learning sequence
- Recommended courses/materials
- Estimated learning time
- Competency for the position

Current skill data:
${JSON.stringify(feedback.skills, null, 2)}
            `;

            const response = await ai.chat(
                [
                    {
                        role: "user",
                        content: [{ type: "text", text: prompt }]
                    }
                ],
                { model: "claude-3-7-sonnet" }
            );

            if (!response) return;

            const text =
                typeof response.message.content === "string"
                    ? response.message.content
                    : response.message.content[0].text;

            await kv.set(kvKey, text);
            navigate("/skillstudy", { state: { studyPlan: text } });
        } catch (err) {
            console.error("Failed to generate or retrieve study plan:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md w-full">
            <div className="flex flex-row items-center p-4 gap-8">
                <ScoreGauge score={feedback.overallScore} />

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Your Resume Score</h2>
                    <p className="text-sm text-gray-500">
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>

            <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
            <Category title="Content" score={feedback.content.score} />
            <Category title="Structure" score={feedback.structure.score} />
            <Category title="Skills" score={feedback.skills.score} />

            <button
                onClick={handleRecommendStudy}
                className="primary-button mt-6 flex items-center justify-center gap-2"
                disabled={loading} // avoid repeat click
            >
                {loading && (
                    <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                    </svg>
                )}
                {loading ? "Generating..." : "Recommended Learning Route"}
            </button>
        </div>
    )
}

export default Summary;
