import { InformationPage } from '../components/InformationPage';

export function PrivacyPage() {
  const lastUpdate = new Date().toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <InformationPage 
      title="Politique de confidentialité" 
      subtitle={`Dernière mise à jour : ${lastUpdate}`}
    >
      <div className="space-y-8">
        <section>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Chez AZAKA CHANS, nous accordons une grande importance à la protection de votre vie privée. 
            Cette politique explique quelles informations nous collectons, comment nous les utilisons et 
            les mesures que nous prenons pour les protéger.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>1. Informations collectées</h2>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#F5F0E6' }}>Données de compte</h3>
          <ul className="space-y-2 text-sm mb-4" style={{ color: '#AAB7C9' }}>
            <li>• Adresse email</li>
            <li>• Mot de passe (stocké de manière sécurisée sous forme de hachage)</li>
            <li>• Date de création du compte</li>
            <li>• Historique de connexion</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2" style={{ color: '#F5F0E6' }}>Données relatives aux transactions</h3>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Historique des dépôts et retraits</li>
            <li>• Historique des achats de tickets</li>
            <li>• Historique des gains</li>
            <li>• Informations de paiement (numéros de téléphone MonCash/NatCash)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>2. Utilisation des informations</h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#AAB7C9' }}>
            Nous utilisons vos informations pour :
          </p>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Fournir et maintenir le service</li>
            <li>• Traiter vos transactions et paiements</li>
            <li>• Communiquer avec vous concernant votre compte</li>
            <li>• Assurer la sécurité de la plateforme</li>
            <li>• Détecter et prévenir les fraudes</li>
            <li>• Respecter nos obligations légales</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>3. Sécurité</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger 
            vos données :
          </p>
          <ul className="space-y-2 text-sm mt-3" style={{ color: '#AAB7C9' }}>
            <li>• Chiffrement des données en transit (HTTPS/TLS)</li>
            <li>• Hachage sécurisé des mots de passe</li>
            <li>• Contrôle d'accès strict aux données</li>
            <li>• Surveillance continue des activités suspectes</li>
            <li>• Audit régulier de nos systèmes de sécurité</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>4. Conservation des données</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Nous conservons vos données aussi longtemps que nécessaire pour fournir le service et respecter 
            nos obligations légales. Les données de transactions sont conservées conformément aux exigences 
            réglementaires applicables.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>5. Partage des données</h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#AAB7C9' }}>
            Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations avec :
          </p>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• <strong>Prestataires de paiement</strong> : Pour traiter vos dépôts et retraits (MonCash, NatCash)</li>
            <li>• <strong>Autorités légales</strong> : Si requis par la loi ou pour protéger nos droits</li>
            <li>• <strong>Sous-traitants</strong> : Qui nous aident à fournir le service, sous réserve de confidentialité</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>6. Services tiers</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Notre plateforme utilise des services tiers pour les paiements (MonCash, NatCash). Ces services 
            ont leurs propres politiques de confidentialité. Nous vous recommandons de les consulter.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>7. Droits de l'utilisateur</h2>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#AAB7C9' }}>
            Selon la réglementation applicable, vous pouvez avoir les droits suivants :
          </p>
          <ul className="space-y-2 text-sm" style={{ color: '#AAB7C9' }}>
            <li>• Accéder à vos données personnelles</li>
            <li>• Corriger des données inexactes</li>
            <li>• Demander la suppression de vos données (sous réserve des obligations légales)</li>
            <li>• Vous opposer au traitement de vos données</li>
            <li>• Demander la portabilité de vos données</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3" style={{ color: '#AAB7C9' }}>
            Pour exercer ces droits, contactez-nous via la page Contact.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>8. Cookies et technologies similaires</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Nous utilisons des cookies et des technologies similaires pour :
          </p>
          <ul className="space-y-2 text-sm mt-3" style={{ color: '#AAB7C9' }}>
            <li>• Maintenir votre session de connexion</li>
            <li>• Améliorer l'expérience utilisateur</li>
            <li>• Analyser l'utilisation du service</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3" style={{ color: '#AAB7C9' }}>
            Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela peut affecter 
            le fonctionnement du service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>9. Protection des mineurs</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Notre service n'est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas 
            sciemment des informations auprès de mineurs. Si vous pensez qu'un mineur a créé un compte, 
            contactez-nous immédiatement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>10. Modifications de la politique</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Nous pouvons mettre à jour cette politique de confidentialité. Les modifications seront 
            publiées sur cette page avec une date de mise à jour. Nous vous encourageons à consulter 
            régulièrement cette page pour rester informé.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#D4AF37' }}>11. Contact</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#AAB7C9' }}>
            Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
            contactez-nous via la page Contact ou à l'adresse cleefolig@gmail.com.
          </p>
        </section>

        {/* Note finale */}
        <div className="mt-12 p-6 rounded-xl" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
          <p className="text-sm" style={{ color: '#AAB7C9' }}>
            <strong style={{ color: '#D4AF37' }}>Note importante :</strong> Cette politique de confidentialité 
            est fournie à titre informatif. Pour une plateforme réelle, il est essentiel de consulter un 
            juriste spécialisé pour s'assurer de la conformité avec les réglementations locales en matière 
            de protection des données personnelles.
          </p>
        </div>
      </div>
    </InformationPage>
  );
}
