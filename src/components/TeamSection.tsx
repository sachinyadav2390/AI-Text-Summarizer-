"use client";

const teamMembers = [
    {
        name: "Sachin Yadav",
        role: "Frontend Developer",
        initials: "SY",
        color: "from-red-600 to-red-400",
        linkedin: "https://www.linkedin.com/in/sachin-yadav-248374327",
        github: "https://github.com/sachinyadav2390"
    },
    {
        name: "Tanveer Jamal",
        role: "Backend Developer",
        initials: "TJ",
        color: "from-red-700 to-red-500",
        linkedin: "https://www.linkedin.com/in/tanveerjamal",
        github: "https://github.com/Tanveerjamal2026"
    },
    {
        name: "Abhishek Rai",
        role: "Backend Developer",
        initials: "AR",
        color: "from-red-500 to-red-300",
        linkedin: "https://linkedin.com/in/abhishek-rai-787953294",
        github: "https://github.com/Abhishek-453"
    },
    {
        name: "Sadaf",
        role: "Database Developer",
        initials: "SD",
        color: "from-red-400 to-red-200",
        linkedin: "https://www.linkedin.com/in/sadafshams545",
        github: "https://github.com/sadafshams545"
    }
];

export default function TeamSection() {
    return (
        <section id="team" className="py-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">Meet Our Team</h2>
                    <div className="h-1 w-20 bg-red-500 mx-auto rounded-full mb-6" />
                    <p className="max-w-2xl mx-auto text-gray-500 text-lg">
                        The dedicated developers and contributors behind the AI Text Summarizer project.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {teamMembers.map((member, idx) => (
                        <div
                            key={idx}
                            className="glass-card p-8 text-center group hover:scale-[1.02] transition-all duration-300 animate-fade-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div
                                className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br ${member.color} shadow-lg group-hover:shadow-red-200 group-hover:rotate-3 transition-all`}
                            >
                                {member.initials}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-red-600 transition-colors">
                                {member.name}
                            </h3>
                            <p className="text-sm font-medium text-red-500 uppercase tracking-wider mb-4">
                                {member.role}
                            </p>
                            <div className="flex justify-center gap-3">
                                <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                                    title="LinkedIn"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                                <a
                                    href={member.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                                    title="GitHub"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background patterns */}
            <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-red-50/50 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-red-50/50 rounded-full blur-3xl" />
        </section>
    );
}
