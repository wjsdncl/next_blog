import { FaReact, FaGithub, FaMobileAlt, FaBlog } from "react-icons/fa";
import { HiMail } from "react-icons/hi";
import { SiNextdotjs, SiTypescript, SiJavascript, SiTailwindcss } from "react-icons/si";

export default function AboutPage() {
  const techStack = [
    { icon: <FaReact className="text-4xl text-[#61DAFB]" />, label: "React" },
    { icon: <SiNextdotjs className="text-4xl text-black" />, label: "Next.js" },
    { icon: <SiJavascript className="text-4xl text-[#F7DF1E]" />, label: "JavaScript" },
    { icon: <SiTypescript className="text-4xl text-[#3178C6]" />, label: "TypeScript" },
    { icon: <FaMobileAlt className="text-4xl text-[#61DAFB]" />, label: "React Native" },
    { icon: <SiTailwindcss className="text-4xl text-[#06B6D4]" />, label: "Tailwind" },
  ];

  return (
    <div className="mx-auto size-full max-w-4xl px-5 py-12 md:py-20">
      {/* 헤로 섹션 */}
      <section className="mb-20 text-center">
        <div className="relative inline-block">
          {/* <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-[14px]" /> */}
          <h1 className="relative text-5xl font-bold tracking-tight md:text-6xl">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">정민재</span>
          </h1>
        </div>
        <p className="mt-4 text-2xl font-medium text-gray-800">사용자 경험을 완성하는 개발자</p>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-700">
          <span className="mb-4 block font-medium text-brand-quaternary">{`"개발자가 불편해야 사용자가 편하다"`}</span>
          프론트엔드의 시각적 표현과 기술적 완성도의 조화를 추구합니다. 사용자 피드백을 반영한 개선 경험을 바탕으로,
          눈에 보이는 결과물에서 보람을 느끼는 개발자입니다.
        </p>
      </section>

      {/* 기술 스택 섹션 */}
      <section className="mb-20">
        <h2 className="mb-12 text-center text-3xl font-bold">Tech Stack</h2>
        <div className="grid grid-cols-3 gap-6 md:grid-cols-6">
          {techStack.map(({ icon, label }, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center space-y-2 rounded-xl bg-gray-200 p-4 transition-all duration-300 hover:bg-gray-300 hover:shadow-lg"
            >
              <div className="flex size-12 items-center justify-center">{icon}</div>
              <span className="text-sm font-medium text-gray-800">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 연락처 섹션 */}
      <div className="flex flex-col items-center space-y-6">
        <h3 className="text-2xl font-bold">{"Let's Connect!"}</h3>
        <div className="flex space-x-8">
          {[
            {
              name: "GitHub",
              icon: <FaGithub className="text-4xl hover:text-purple-600" />,
              url: "https://github.com/wjsdncl",
            },
            {
              name: "Email",
              icon: <HiMail className="text-4xl hover:text-blue-600" />,
              url: "mailto:wjsdncl2222@gmail.com",
            },
            {
              name: "Blog",
              icon: <FaBlog className="text-4xl hover:text-green-600" />,
              url: "/",
            },
          ].map((link) => (
            <a key={link.name} href={link.url} className="transition-transform duration-300 hover:scale-110">
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
