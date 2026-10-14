import { InformationPage } from '../components/InformationPage';

export function TermsPage() {
  const lastUpdate = new Date().toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <InformationPage 
      title="Conditions d'utilisation" 
      subtitle={`Dernière mise à jour : ${lastUpdate}`}
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>1. Objet</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Les présentes conditions d'utilisation régissent l'accès et l'utilisation de la plateforme AZAKA CHANS, 
            un service de loterie numérique proposant l'achat de tickets physiques et virtuels avec possibilité de gains.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>2. Acceptation des conditions</h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#AAB7C9' }}>
            En créant un compte et en utilisant la plateforme AZAKA CHANS, vous acceptez sans réserve les présentes 
            conditions d'utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entreront en 
            vigueur dès leur publication sur la plateforme.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>3. Création et utilisation du compte</h2>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Vous devez avoir au moins 18 ans pour créer un compte</li>
            <li>• Vous devez fournir des informations exactes et complètes</li>
            <li>• Vous êtes responsable de la sécurité de votre compte et de votre mot de passe</li>
            <li>• Vous ne pouvez pas créer plusieurs comptes</li>
            <li>• Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>4. Responsabilités de l'utilisateur</h2>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Utiliser le service de manière légale et responsable</li>
            <li>• Ne pas tenter de pirater ou perturber le service</li>
            <li>• Ne pas utiliser le service à des fins frauduleuses</li>
            <li>• Respecter les droits des autres utilisateurs</li>
            <li>• Jouer de manière responsable et dans la limite de vos moyens financiers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>5. Tickets et participations</h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#AAB7C9' }}>
            Les tickets achetés sont personnels et non transférables. Les résultats des tickets sont déterminés de 
            manière sécurisée avant la vente et ne peuvent pas être modifiés.
          </p>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Chaque ticket possède un résultat prédéterminé</li>
            <li>• Les tickets ne peuvent pas être remboursés après l'achat</li>
            <li>• Les résultats sont révélés de manière sécurisée par le système</li>
            <li>• Les gains sont crédités automatiquement dans votre portefeuille</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>6. Dépôts et portefeuille</h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#AAB7C9' }}>
            Les dépôts sont effectués via des prestataires de paiement autorisés (MonCash, NatCash). Les fonds 
            déposés sont crédités dans votre portefeuille virtuel après confirmation du paiement.
          </p>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Les dépôts sont définitifs et non remboursables</li>
            <li>• Les retraits sont soumis à vérification et peuvent prendre jusqu'à 48 heures</li>
            <li>• Nous nous réservons le droit de refuser ou de retarder un retrait en cas de suspicion de fraude</li>
            <li>• Les soldes inactifs pendant une période prolongée peuvent être soumis à des frais de maintenance</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>7. Tirages et résultats</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Les résultats des tickets sont générés de manière cryptographiquement sécurisée avant la mise en vente. 
            Le système garantit l'immutabilité des résultats et l'équité du processus.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>8. Gains</h2>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Les gains sont crédités automatiquement dans votre portefeuille</li>
            <li>• Les gains peuvent être retirés via MonCash ou NatCash</li>
            <li>• Les retraits sont soumis à vérification et à des limites quotidiennes</li>
            <li>• Les gains sont soumis aux réglementations fiscales en vigueur</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>9. Utilisation interdite</h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#AAB7C9' }}>
            Il est strictement interdit de :
          </p>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Utiliser le service si vous avez moins de 18 ans</li>
            <li>• Tenter de pirater, perturber ou contourner les mesures de sécurité</li>
            <li>• Utiliser des bots, scripts ou outils automatisés</li>
            <li>• Créer plusieurs comptes pour contourner les limites</li>
            <li>• Blanchir de l'argent ou financer des activités illégales</li>
            <li>• Harceler ou abuser d'autres utilisateurs</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>10. Sécurité du compte</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Vous êtes responsable de la sécurité de votre compte. Nous recommandons d'utiliser un mot de passe 
            fort et unique, d'activer l'authentification à deux facteurs et de ne jamais partager vos identifiants.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>11. Disponibilité du service</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Nous nous efforçons de maintenir le service disponible 24h/24 et 7j/7. Cependant, nous ne garantissons 
            pas une disponibilité sans interruption. Des maintenances planifiées ou des pannes imprévues peuvent 
            temporairement interrompre le service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>12. Modification des conditions</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront 
            publiées sur cette page avec une date de mise à jour. L'utilisation continue du service après 
            modification constitue votre acceptation des nouvelles conditions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>13. Contact</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter via la page 
            Contact ou à l'adresse cleefolig@gmail.com.
          </p>
        </section>
      </div>
    </InformationPage>
  );
}
