import { useState } from 'react';
import { InformationPage } from '../components/InformationPage';
import { ChevronDown } from 'lucide-react';

export function FAQPage() {
  return (
    <InformationPage 
      title="Foire Aux Questions" 
      subtitle="Trouvez rapidement les réponses à vos questions"
    >
      <div className="space-y-8">
        {/* Compte */}
        <FAQSection title="Compte">
          <FAQItem question="Comment créer un compte ?">
            Pour créer un compte, cliquez sur "Commencer" depuis la page d'accueil. Vous devrez fournir une adresse email valide et créer un mot de passe sécurisé. Suivez ensuite les instructions pour vérifier votre adresse email.
          </FAQItem>
          <FAQItem question="Comment me connecter ?">
            Utilisez votre adresse email et votre mot de passe sur la page de connexion. Si vous avez oublié votre mot de passe, cliquez sur "Mot de passe oublié" pour le réinitialiser.
          </FAQItem>
          <FAQItem question="Comment protéger mon compte ?">
            Utilisez un mot de passe fort et unique. Ne partagez jamais vos identifiants. Activez l'authentification à deux facteurs si disponible. Déconnectez-vous après chaque session sur un appareil partagé.
          </FAQItem>
        </FAQSection>

        {/* Dépôts */}
        <FAQSection title="Dépôts">
          <FAQItem question="Comment déposer de l'argent ?">
            Accédez à votre portefeuille et cliquez sur "Déposer". Choisissez votre méthode de paiement (MonCash ou NatCash), entrez le montant et suivez les instructions pour compléter le paiement.
          </FAQItem>
          <FAQItem question="Quels moyens de paiement sont disponibles ?">
            Nous acceptons actuellement MonCash et NatCash pour les dépôts et les retraits. D'autres méthodes pourront être ajoutées à l'avenir.
          </FAQItem>
          <FAQItem question="Combien de temps faut-il pour qu'un dépôt soit confirmé ?">
            Les dépôts sont généralement confirmés en quelques minutes. Dans certains cas, cela peut prendre jusqu'à 30 minutes selon le prestataire de paiement.
          </FAQItem>
          <FAQItem question="Que faire si mon dépôt n'est pas confirmé ?">
            Si votre dépôt n'apparaît pas après 30 minutes, vérifiez que le paiement a bien été effectué. Si le problème persiste, contactez notre support via la page Contact avec les détails de la transaction.
          </FAQItem>
        </FAQSection>

        {/* Tickets */}
        <FAQSection title="Tickets">
          <FAQItem question="Comment acheter un ticket ?">
            Rendez-vous dans la Boutique, choisissez la catégorie de ticket souhaitée (50, 250, 500 ou 1 000 HTG), sélectionnez la quantité et confirmez l'achat. Le montant sera déduit de votre portefeuille.
          </FAQItem>
          <FAQItem question="Puis-je consulter mes anciens tickets ?">
            Oui, tous vos tickets sont disponibles dans la page "Mes Tickets". Vous pouvez consulter l'historique complet de vos achats et des résultats.
          </FAQItem>
          <FAQItem question="Comment vérifier si j'ai gagné ?">
            Cliquez sur un ticket dans la page "Mes Tickets" pour révéler son résultat. Si le ticket est gagnant, le montant sera automatiquement crédité dans votre portefeuille.
          </FAQItem>
        </FAQSection>

        {/* Tirages */}
        <FAQSection title="Tirages">
          <FAQItem question="Quand les tirages sont-ils effectués ?">
            Les résultats des tickets sont déterminés de manière sécurisée avant la vente. Chaque ticket possède un résultat prédéterminé qui ne peut pas être modifié après l'achat.
          </FAQItem>
          <FAQItem question="Comment les résultats sont-ils publiés ?">
            Les résultats sont révélés lorsque vous choisissez de révéler votre ticket. Le système vérifie l'authenticité du ticket et affiche le résultat de manière sécurisée.
          </FAQItem>
          <FAQItem question="Où puis-je consulter l'historique ?">
            Vous pouvez consulter l'historique de tous vos tickets dans la page "Mes Tickets". L'historique inclut la date d'achat, le statut et les gains éventuels.
          </FAQItem>
        </FAQSection>

        {/* Gains */}
        <FAQSection title="Gains">
          <FAQItem question="Comment fonctionne un gain ?">
            Lorsqu'un ticket est gagnant, le montant est automatiquement ajouté à votre portefeuille. Vous pouvez ensuite le consulter dans votre solde ou l'historique des transactions.
          </FAQItem>
          <FAQItem question="Comment récupérer un gain ?">
            Accédez à votre portefeuille et cliquez sur "Retirer". Choisissez votre méthode de paiement (MonCash ou NatCash), entrez le montant et confirmez le retrait.
          </FAQItem>
          <FAQItem question="Que faire en cas de problème avec un gain ?">
            Si votre gain n'a pas été crédité ou si vous rencontrez un problème lors du retrait, contactez notre support via la page Contact avec les détails de la transaction.
          </FAQItem>
        </FAQSection>

        {/* Sécurité */}
        <FAQSection title="Sécurité">
          <FAQItem question="Comment mes informations sont-elles protégées ?">
            Nous utilisons des technologies de chiffrement avancées pour protéger vos données. Les mots de passe sont hachés de manière sécurisée et les transactions sont protégées par des mécanismes cryptographiques.
          </FAQItem>
          <FAQItem question="Que faire si je pense que mon compte a été compromis ?">
            Changez immédiatement votre mot de passe et contactez notre support. Nous vous aiderons à sécuriser votre compte et à vérifier l'activité suspecte.
          </FAQItem>
        </FAQSection>
      </div>
    </InformationPage>
  );
}

function FAQSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#F5F0E6' }}>{title}</h2>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}

function FAQItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(11, 31, 58, 0.5)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:opacity-80 transition"
        aria-expanded={isOpen}
      >
        <span className="font-semibold" style={{ color: '#F5F0E6' }}>{question}</span>
        <ChevronDown 
          className="w-5 h-5 transition-transform flex-shrink-0 ml-4" 
          style={{ 
            color: '#D4AF37',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-sm" style={{ color: '#AAB7C9' }}>{children}</p>
        </div>
      )}
    </div>
  );
}
