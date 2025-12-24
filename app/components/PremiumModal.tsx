"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown, Check, QrCode, MessageSquare, Clock } from "lucide-react"
import Image from "next/image"
import viplogo from "@/assets/viplogo.png"

interface PremiumModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PremiumModal({ open, onOpenChange }: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | null>(null)
  const [step, setStep] = useState<"plans" | "payment">("plans")

  const plans = [
    {
      id: "monthly",
      name: "Mensal",
      price: "R$ 9,99",
      period: "/mês",
      description: "Renovação mensal",
      popular: false,
      savings: "Plano em promoção!",
    },
    {
      id: "quarterly",
      name: "Trimestral",
      price: "R$ 24,50",
      period: "/3 meses",
      description: "Economize 10%",
      popular: true,
      savings: "R$ 5,47 de desconto",
    },
  ]

  const benefits = [
    "Sem anúncios durante a reprodução",
    "Qualidade de vídeo em Full HD e 4K",
    "Acesso antecipado a novos lançamentos",
    "Download para assistir offline",
    "Suporte prioritário 24/7",
    "Atualizações antecipadas",
  ]

  const handleSelectPlan = (planId: "monthly" | "quarterly") => {
    setSelectedPlan(planId)
    setStep("payment")
  }

  const handleBack = () => {
    setStep("plans")
    setSelectedPlan(null)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep("plans")
      setSelectedPlan(null)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-background via-background to-primary/5">
        {step === "plans" ? (
          <div className="p-8">
            <DialogHeader className="text-center mb-8">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/0 rounded-full flex items-center justify-center animate-pulse">

                <Image src={viplogo} alt="C" className="max-w-16"/>
              </div>
              <DialogTitle className="text-3xl font-bold text-primary text-center">
                Assine o CriaFlix Premium
              </DialogTitle>
              <p className="text-muted-foreground mt-2 text-center">
                Desbloqueie todos os recursos e tenha a melhor experiência<br/> de streaming com todas plataformas em um só lugar.
              </p>
            </DialogHeader>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border/50">
              <h3 className="col-span-full text-lg font-semibold mb-2">Benefícios Premium</h3>
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 animate-in fade-in slide-in-from-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground/90">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-xl p-6 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                    plan.popular
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                  onClick={() => handleSelectPlan(plan.id as "monthly" | "quarterly")}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                      MAIS POPULAR
                    </div>
                  )}
                  <div className="text-center">
                    <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                    {plan.savings && <p className="text-sm font-semibold text-primary mb-4">{plan.savings}</p>}
                    <Button
                      className={`w-full ${
                        plan.popular ? "bg-primary hover:opacity-90 text-white" : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Selecionar Plano
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8">
            <DialogHeader className="mb-6">
              <Button variant="ghost" onClick={handleBack} className="w-fit mb-4">
                ← Voltar aos planos
              </Button>
              <DialogTitle className="text-2xl font-bold">Finalizar Assinatura</DialogTitle>
              <p className="text-muted-foreground">
                Plano selecionado:{" "}
                <span className="font-semibold text-foreground">
                  {plans.find((p) => p.id === selectedPlan)?.name} - {plans.find((p) => p.id === selectedPlan)?.price}
                </span>
              </p>
            </DialogHeader>

            <div className="space-y-6">
              {/* Step 1: QR Code */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Escaneie o QR Code para pagamento
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use o aplicativo do seu banco ou carteira digital para escanear o código PIX abaixo
                    </p>
                    <div className="bg-white p-4 rounded-lg w-fit mx-auto">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        alt="QR Code PIX"
                        width={200}
                        height={200}
                        className="rounded"
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Chave PIX: <span className="font-mono">premium@criaflix.com</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Send Receipt */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Envie o comprovante no Discord
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Após realizar o pagamento, abra um ticket no nosso servidor do Discord e envie o comprovante
                    </p>
                    <Button
                      className="w-full text-white"
                      onClick={() => window.open("https://discord.gg/criaflix", "_blank")}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Abrir Discord
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 3: Wait for Activation */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Aguarde a ativação
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Nossa equipe irá verificar seu pagamento e ativar sua assinatura Premium em até 24 horas. Você
                      receberá uma notificação quando estiver ativo!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm">
                <p className="text-center text-foreground/80">
                  <strong>Importante:</strong> Certifique-se de enviar o comprovante correto com o valor exato do plano
                  selecionado para evitar atrasos na ativação.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
