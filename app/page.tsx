"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import LoginForm from "./components/LoginForm"
import { TextAnimate } from "../components/ui/text-animate"
import { useTranslations } from "next-intl"

function Home() {
  const t = useTranslations("HomePage")

  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "authenticated") {
    router.push("/home")
    return null
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="relative w-full md:w-2/3 hidden md:block">
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url("https://midianinja.org/wp-content/uploads/2024/07/Deadpool-Wolverine-a-Marvel-contra-ataca-nos-cine0326311000202407251909.jpg")`,
            }}
          >
            <div className="absolute inset-0 bg-zinc-950 bg-opacity-90 backdrop-blur-sm" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-6">
            <TextAnimate text="#V3" type="rollIn" />
            <h1 className="text-4xl font-bold mb-4">
              {t("welcome")}{" "}
              <b className="bg-gradient-to-r from-[#3f49a7] to-indigo-400 text-transparent bg-clip-text">CriaFlix.</b>
            </h1>
            <p className="text-lg max-w-lg text-center text-zinc-300">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/3 flex justify-center items-center bg-gray-100 md:bg-transparent h-screen">
        <div className="max-w-md w-full p-6">
          <h2 className="text-3xl font-bold text-center uppercase">Login</h2>
          <h3 className="text-center text-sm text-zinc-500 mb-4">Choose a connection:</h3>
          <div className="p-4 rounded-md">
            <LoginForm />
            <p className="text-zinc-600 text-sm mt-6 text-center">
              By signing in, you agree to CriaFlix <span className="underline">Terms of Service</span>
              <br />
              <span className="underline">Privacy Policy</span> and{" "}
              <span className="underline">Data Usage Properties</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
