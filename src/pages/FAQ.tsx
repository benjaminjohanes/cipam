import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Users, BookOpen, Calendar, CreditCard, Shield, MessageCircle } from "lucide-react";

const faqCategories = [
  {
    title: "Général",
    icon: HelpCircle,
    questions: [
      {
        question: "Qu'est-ce que ALLÔ PSY ?",
        answer: "ALLÔ PSY est une plateforme dédiée à la psychologie pratique. Nous mettons en relation des usagers avec des professionnels qualifiés, proposons des formations en psychologie et offrons des services de consultation en ligne et en présentiel."
      },
      {
        question: "Comment fonctionne la plateforme ?",
        answer: "La plateforme permet aux usagers de trouver des professionnels, de prendre des rendez-vous pour des consultations, de suivre des formations en ligne et d'accéder à des ressources en psychologie. Les professionnels peuvent proposer leurs services, créer des formations et gérer leurs rendez-vous."
      },
      {
        question: "La plateforme est-elle accessible à l'international ?",
        answer: "Oui, ALLÔ PSY est accessible dans le monde entier. Nos professionnels peuvent proposer des consultations en ligne (vidéo) ce qui permet un accompagnement à distance, peu importe votre localisation géographique."
      }
    ]
  },
  {
    title: "Inscription & Compte",
    icon: Users,
    questions: [
      {
        question: "Comment créer un compte sur ALLÔ PSY ?",
        answer: "Pour créer un compte, cliquez sur 'S'inscrire' en haut de la page. Remplissez le formulaire avec vos informations personnelles, choisissez votre type de compte (Usager, Étudiant ou Professionnel) et validez votre inscription. Un email de confirmation vous sera envoyé."
      },
      {
        question: "Quels sont les différents types de comptes ?",
        answer: "ALLÔ PSY propose trois types de comptes : Usager (pour accéder aux consultations et services), Étudiant (pour proposer des services supervisés et suivre des formations), et Professionnel (pour offrir des services, formations et consultations de manière autonome)."
      },
      {
        question: "Y a-t-il un âge minimum pour s'inscrire ?",
        answer: "Oui, vous devez avoir au moins 18 ans pour créer un compte sur ALLÔ PSY. Cette restriction est en place pour garantir la conformité légale et la protection des utilisateurs."
      },
      {
        question: "Comment devenir professionnel sur la plateforme ?",
        answer: "Si vous êtes inscrit en tant qu'étudiant, vous pouvez demander une mise à niveau vers un compte professionnel depuis votre tableau de bord. Votre demande sera examinée par notre équipe administrative qui vérifiera vos qualifications."
      }
    ]
  },
  {
    title: "Formations",
    icon: BookOpen,
    questions: [
      {
        question: "Comment accéder aux formations ?",
        answer: "Après vous être connecté, rendez-vous dans la section 'Formations' pour découvrir notre catalogue. Vous pouvez acheter une formation et y accéder immédiatement depuis votre tableau de bord dans 'Mes formations'."
      },
      {
        question: "Les formations sont-elles certifiantes ?",
        answer: "Certaines formations proposent des certificats de complétion. Les détails concernant la certification sont indiqués sur la page de chaque formation. Vérifiez les informations avant votre achat."
      },
      {
        question: "Puis-je proposer mes propres formations ?",
        answer: "Oui, si vous êtes inscrit en tant que professionnel ou étudiant, vous pouvez créer et proposer des formations. Celles-ci seront soumises à validation par notre équipe avant publication."
      },
      {
        question: "Combien de temps ai-je accès à une formation après l'achat ?",
        answer: "Une fois achetée, vous avez un accès illimité à la formation. Vous pouvez la suivre à votre rythme et y revenir autant de fois que vous le souhaitez."
      }
    ]
  },
  {
    title: "Rendez-vous & Consultations",
    icon: Calendar,
    questions: [
      {
        question: "Comment prendre un rendez-vous ?",
        answer: "Consultez notre annuaire de professionnels, sélectionnez celui qui correspond à vos besoins, puis cliquez sur 'Prendre rendez-vous'. Choisissez un créneau disponible, le type de consultation (vidéo ou présentiel) et confirmez votre réservation."
      },
      {
        question: "Puis-je annuler ou reporter un rendez-vous ?",
        answer: "Oui, vous pouvez annuler ou reporter votre rendez-vous depuis votre tableau de bord. Nous vous recommandons de le faire au moins 24 heures à l'avance par respect pour le professionnel."
      },
      {
        question: "Comment se déroule une consultation en vidéo ?",
        answer: "Avant l'heure du rendez-vous, vous recevrez un lien de connexion. Assurez-vous d'avoir une connexion internet stable, une webcam et un microphone fonctionnels. Le professionnel vous rejoindra à l'heure convenue."
      },
      {
        question: "Les consultations sont-elles confidentielles ?",
        answer: "Absolument. Toutes les consultations sont strictement confidentielles et soumises au secret professionnel. Les échanges entre vous et le professionnel restent privés et sécurisés."
      }
    ]
  },
  {
    title: "Paiements & Facturation",
    icon: CreditCard,
    questions: [
      {
        question: "Quels moyens de paiement sont acceptés ?",
        answer: "Nous acceptons les paiements par carte bancaire (Visa, Mastercard) et par mobile money. Tous les paiements sont sécurisés et cryptés."
      },
      {
        question: "Puis-je obtenir un remboursement ?",
        answer: "Les conditions de remboursement varient selon le type de service. Pour les formations, un remboursement est possible dans les 14 jours suivant l'achat si vous n'avez pas commencé le cours. Pour les consultations, contactez-nous pour discuter de votre situation."
      },
      {
        question: "Comment obtenir une facture ?",
        answer: "Toutes vos factures sont disponibles dans votre tableau de bord, section 'Historique des paiements'. Vous pouvez les télécharger au format PDF à tout moment."
      }
    ]
  },
  {
    title: "Sécurité & Confidentialité",
    icon: Shield,
    questions: [
      {
        question: "Mes données personnelles sont-elles protégées ?",
        answer: "Oui, la protection de vos données est notre priorité. Nous utilisons des protocoles de sécurité avancés et respectons les réglementations en vigueur sur la protection des données personnelles."
      },
      {
        question: "Qui peut voir mon profil ?",
        answer: "Seules les informations que vous choisissez de rendre publiques sont visibles. Vos données de santé et vos échanges avec les professionnels restent strictement confidentiels."
      },
      {
        question: "Comment signaler un comportement inapproprié ?",
        answer: "Si vous êtes témoin ou victime d'un comportement inapproprié, contactez-nous immédiatement via notre formulaire de contact ou par email. Nous traiterons votre signalement avec la plus grande confidentialité."
      }
    ]
  },
  {
    title: "Support & Contact",
    icon: MessageCircle,
    questions: [
      {
        question: "Comment contacter le support ?",
        answer: "Vous pouvez nous contacter par email à cipam.global.contact@gmail.com ou par téléphone au +229 01 52 40 14 70. Notre équipe est disponible du lundi au vendredi de 8h à 18h."
      },
      {
        question: "Quel est le délai de réponse du support ?",
        answer: "Nous nous efforçons de répondre à toutes les demandes dans un délai de 24 à 48 heures ouvrées. Les demandes urgentes sont traitées en priorité."
      },
      {
        question: "Où trouver plus d'informations sur ALLÔ PSY ?",
        answer: "Consultez notre section Articles pour des ressources en psychologie, suivez-nous sur les réseaux sociaux ou abonnez-vous à notre newsletter pour rester informé de nos actualités."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                <HelpCircle className="h-4 w-4" />
                Centre d'aide
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                Foire Aux Questions
              </h1>
              <p className="text-lg text-muted-foreground">
                Trouvez rapidement les réponses à vos questions sur CIPAM, nos services, 
                nos formations et le fonctionnement de la plateforme.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-8">
              {faqCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-display font-semibold text-foreground">
                      {category.title}
                    </h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem 
                        key={faqIndex} 
                        value={`${categoryIndex}-${faqIndex}`}
                        className="border border-border rounded-lg px-4 data-[state=open]:bg-muted/50"
                      >
                        <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              ))}
            </div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-16 text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-display font-semibold text-foreground mb-4">
                Vous n'avez pas trouvé votre réponse ?
              </h3>
              <p className="text-muted-foreground mb-6">
                Notre équipe est là pour vous aider. N'hésitez pas à nous contacter directement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:cipam.global.contact@gmail.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Nous contacter
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}