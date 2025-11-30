# MaquisPro+ V1.0.1

Application mobile de gestion pour bars et établissements de nuit.

## 🎯 Objectif

MaquisPro+ est une solution complète de gestion pour les bars, maquis et établissements de nuit, offrant des interfaces dédiées pour chaque rôle utilisateur :

- **Propriétaire/Gérant** : Tableau de bord complet avec gestion des bars, employés, inventaire et rapports
- **Caissier/Barman** : Gestion de caisse, création de commandes et supervision des serveurs
- **Serveur** : Interface simplifiée pour gérer les commandes attribuées et les paiements

## 🎨 Identité Visuelle

- **Nom** : MaquisPro+
- **Thème** : Bar/Gestion professionnelle
- **Palette de couleurs** :
  - Primaire (Bleu Profond) : `#19386A`
  - Secondaire (Vert Vif) : `#5CB85C`
  - Fond/Texte (Blanc Pur) : `#FFFFFF`

## 🚀 Technologies

- **Framework** : React Native avec Expo
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Navigation** : React Navigation
- **Stockage local** : AsyncStorage

## 📦 Installation

```bash
# Installer les dépendances
pnpm install

# Démarrer l'application
pnpm start

# Lancer sur Android
pnpm android

# Lancer sur iOS
pnpm ios
```

## 🔧 Configuration

1. Créer un compte Supabase sur https://supabase.com
2. Créer un nouveau projet
3. Copier les variables d'environnement dans `.env` :

```env
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
```

## 📱 Fonctionnalités

### Propriétaire/Gérant
- Tableau de bord avec indicateurs clés (ventes, bénéfices, inventaire, crédits)
- Gestion des bars (création, codes d'invitation)
- Gestion des employés (visualisation, modification de rôle, révocation)
- Gestion des boissons/articles (nom, prix, coût, catégorie, unités)
- Gestion des paiements Mobile Money (upload de QR codes)

### Caissier/Barman
- Gestion de caisse (ouverture/fermeture avec montants)
- Création de commandes (sélection d'articles, quantité, table/client)
- Supervision des serveurs (liste, statut, attribution)

### Serveur
- Liste des commandes attribuées
- Mise à jour du statut (En préparation, Prête, Servie)
- Accès aux QR codes Mobile Money

## 📊 Base de Données

Le schéma de base de données inclut :
- `profiles` : Profils utilisateurs avec rôles
- `bars` : Établissements gérés
- `bar_members` : Association utilisateurs-bars
- `products` : Articles/boissons
- `orders` : Commandes
- `order_items` : Détails des commandes
- `cash_registers` : Sessions de caisse
- `payment_methods` : Méthodes de paiement Mobile Money

## 📄 Licence

MIT

## 👥 Auteur

MaquisPro+ Team
"# MaquisProPlus"  
"# MaquisProPlus"  
