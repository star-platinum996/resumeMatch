import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";
import companies from "../../data/companies.json";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);

        setStatusText('Uploading the file...');
        const uploadedFile = await fs.upload([file]);
        if(!uploadedFile) return setStatusText('Error: Failed to upload file');

        setStatusText('Converting to image...');
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return setStatusText('Error: Failed to convert PDF to image');

        setStatusText('Uploading the image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage) return setStatusText('Error: Failed to upload image');

        setStatusText('Preparing data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            feedback: '',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        )
        if (!feedback) return setStatusText('Error: Failed to analyze resume');

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting...');
        console.log(data);
        navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="company-name">Company Name</label>

                                    <a
                                        href="https://www.linkedin.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-4 text-blue-600 hover:underline text-sm"
                                    >
                                        Not having a target yet? Go through LinkedIn.
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(true)}
                                        className="text-sm ml-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                                    >
                                        Or Choose our jobs
                                    </button>
                                </div>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div
                        className="w-96 p-6 rounded-2xl shadow-2xl animate-fade-in bg-cover bg-center relative"
                        style={{
                            backgroundImage: "url('/images/bg-main.svg')",
                        }}
                    >
                        <div className="backdrop-blur-md bg-white/70 rounded-xl p-4 shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
                                Select a Company
                            </h2>

                            {/* Company list */}
                            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                                {companies.map((c) => (
                                    <div
                                        key={c.companyName}
                                        className="border border-gray-300 p-3 rounded-lg bg-white/70 backdrop-blur-sm hover:bg-white/90 cursor-pointer transition"
                                        onClick={() => setSelectedCompany(c)}
                                    >
                                        <p className="font-bold text-gray-800">{c.companyName}</p>
                                        <p className="text-sm text-gray-600">{c.jobs.length} positions</p>
                                    </div>
                                ))}
                            </div>

                            {/* Job list */}
                            {selectedCompany && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold text-gray-800 text-center">
                                        {selectedCompany.companyName} Jobs
                                    </h3>

                                    <div className="flex flex-col gap-3 mt-2 max-h-60 overflow-y-auto">
                                        {selectedCompany.jobs.map((job, idx) => (
                                            <div
                                                key={idx}
                                                className="border border-gray-300 p-3 rounded-lg bg-white/70 backdrop-blur-sm hover:bg-indigo-100 cursor-pointer transition"
                                                onClick={() => {
                                                    (document.getElementById("company-name") as HTMLInputElement).value =
                                                        selectedCompany.companyName;

                                                    (document.getElementById("job-title") as HTMLInputElement).value =
                                                        job.jobTitle;

                                                    (document.getElementById("job-description") as HTMLTextAreaElement).value =
                                                        job.jobDescription;

                                                    setShowModal(false);
                                                }}
                                            >
                                                <p className="font-bold text-gray-800">{job.jobTitle}</p>
                                                <p className="text-sm text-gray-600">
                                                    {job.jobDescription.slice(0, 80)}...
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Close button */}
                            <button
                                className="mt-5 w-full py-2 rounded-lg bg-indigo-200 hover:bg-indigo-300 text-indigo-700 font-semibold transition"
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    )
}
export default Upload
