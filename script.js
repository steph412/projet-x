const formulaire = document.getElementById("documentForm");
const champDocument = document.getElementById("document");
const resultat = document.getElementById("resultat");

const documentA = document.getElementById("documentA");
const documentB = document.getElementById("documentB");
const boutonComparer = document.getElementById("comparerDocuments");
const resultatComparaison = document.getElementById("resultatComparaison");

const historique = document.getElementById("historique");
const boutonEffacer = document.getElementById("effacerHistorique");

const CLE_HISTORIQUE = "projetX_historique";

// Calculer l'empreinte SHA-256 d'un fichier
async function calculerEmpreinte(fichier) {
    const contenu = await fichier.arrayBuffer();

    const empreinte = await crypto.subtle.digest(
        "SHA-256",
        contenu
    );

    return Array.from(new Uint8Array(empreinte))
        .map(octet => octet.toString(16).padStart(2, "0"))
        .join("");
}

// Enregistrer une analyse dans l'historique
function enregistrerAnalyse(fichier, empreinte) {
    const analyses = JSON.parse(
        localStorage.getItem(CLE_HISTORIQUE) || "[]"
    );

    analyses.unshift({
        nom: fichier.name,
        taille: fichier.size,
        empreinte: empreinte,
        date: new Date().toLocaleString("fr-FR")
    });

    // Garder les 20 dernières analyses
    analyses.splice(20);

    localStorage.setItem(
        CLE_HISTORIQUE,
        JSON.stringify(analyses)
    );

    afficherHistorique();
}

// Afficher l'historique
function afficherHistorique() {
    const analyses = JSON.parse(
        localStorage.getItem(CLE_HISTORIQUE) || "[]"
    );

    historique.replaceChildren();

    if (analyses.length === 0) {
        historique.textContent = "Aucune analyse enregistrée.";
        return;
    }

    analyses.forEach(analyse => {
        const carte = document.createElement("div");
        carte.className = "resultat";

        const nom = document.createElement("p");
        nom.textContent = "Document : " + analyse.nom;

        const date = document.createElement("p");
        date.textContent = "Date : " + analyse.date;

        const empreinte = document.createElement("p");
        empreinte.textContent = "SHA-256 : " + analyse.empreinte;
        empreinte.style.overflowWrap = "anywhere";

        const copier = document.createElement("button");
        copier.type = "button";
        copier.className = "btn";
        copier.textContent = "Copier l'empreinte";

        copier.addEventListener("click", async () => {
            await copierTexte(analyse.empreinte);
        });

        carte.append(nom, date, empreinte, copier);
        historique.appendChild(carte);
    });
}

// Copier un texte
async function copierTexte(texte) {
    try {
        await navigator.clipboard.writeText(texte);
        alert("Empreinte copiée !");
    } catch (erreur) {
        alert(
            "La copie automatique est bloquée par le navigateur. " +
            "Sélectionne et copie l'empreinte manuellement."
        );
    }
}

// Analyser un document
formulaire.addEventListener("submit", async function (event) {
    event.preventDefault();

    const fichier = champDocument.files[0];

    if (!fichier) {
        alert("Choisis d'abord un document !");
        return;
    }

    resultat.hidden = false;
    resultat.textContent = "Calcul de l'empreinte en cours...";

    try {
        const empreinte = await calculerEmpreinte(fichier);
        const taille = (fichier.size / (1024 * 1024)).toFixed(2);

        enregistrerAnalyse(fichier, empreinte);

        const titre = document.createElement("h3");
        titre.textContent = "Résultat de l'analyse";

        const nom = document.createElement("p");
        nom.textContent = "Nom : " + fichier.name;

        const format = document.createElement("p");
        format.textContent = "Format : " + (fichier.type || "Non identifié");

        const poids = document.createElement("p");
        poids.textContent = "Taille : " + taille + " Mo";

        const titreEmpreinte = document.createElement("p");
        titreEmpreinte.textContent = "Empreinte SHA-256 :";

        const valeurEmpreinte = document.createElement("p");
        valeurEmpreinte.textContent = empreinte;
        valeurEmpreinte.style.overflowWrap = "anywhere";

        const copier = document.createElement("button");
        copier.type = "button";
        copier.className = "btn";
        copier.textContent = "Copier l'empreinte";

        copier.addEventListener("click", async () => {
            await copierTexte(empreinte);
        });

        const authenticite = document.createElement("p");
        authenticite.textContent =
            "Authenticité : non vérifiée.";

        resultat.replaceChildren(
            titre,
            nom,
            format,
            poids,
            titreEmpreinte,
            valeurEmpreinte,
            copier,
            authenticite
        );

    } catch (erreur) {
        resultat.textContent =
            "Impossible de calculer l'empreinte. Vérifie le contexte sécurisé du navigateur.";
        console.error(erreur);
    }
});

// Comparer deux documents
boutonComparer.addEventListener("click", async function () {
    const fichier1 = documentA.files[0];
    const fichier2 = documentB.files[0];

    resultatComparaison.hidden = false;

    if (!fichier1 || !fichier2) {
        resultatComparaison.textContent =
            "Choisis les deux documents avant de les comparer.";
        return;
    }

    resultatComparaison.textContent =
        "Calcul des empreintes en cours...";

    try {
        const hash1 = await calculerEmpreinte(fichier1);
        const hash2 = await calculerEmpreinte(fichier2);

        if (hash1 === hash2) {
            resultatComparaison.textContent =
                "Résultat : les deux fichiers ont un contenu identique.";
        } else {
            resultatComparaison.textContent =
                "Résultat : les deux fichiers ont un contenu différent.";
        }
    } catch (erreur) {
        resultatComparaison.textContent =
            "Impossible de comparer les fichiers.";
        console.error(erreur);
    }
});

// Effacer l'historique
boutonEffacer.addEventListener("click", function () {
    const confirmation = confirm(
        "Veux-tu vraiment effacer tout l'historique ?"
    );

    if (confirmation) {
        localStorage.removeItem(CLE_HISTORIQUE);
        afficherHistorique();
    }
});

// Charger l'historique à l'ouverture
afficherHistorique();
// Vérification d'une empreinte de référence

const documentReference =
    document.getElementById("documentReference");

const champEmpreinteReference =
    document.getElementById("empreinteReference");

const boutonVerifierReference =
    document.getElementById("verifierReference");

const resultatReference =
    document.getElementById("resultatReference");

boutonVerifierReference.addEventListener("click", async function () {
    const fichier = documentReference.files[0];

    const empreinteAttendue =
        champEmpreinteReference.value.trim().toLowerCase();

    resultatReference.hidden = false;

    if (!fichier) {
        resultatReference.textContent =
            "Erreur : sélectionne d'abord un document.";
        return;
    }

    // Vérifier que la référence contient 64 caractères hexadécimaux
    if (!/^[a-f0-9]{64}$/.test(empreinteAttendue)) {
        resultatReference.textContent =
            "Erreur : saisis une empreinte SHA-256 valide de 64 caractères hexadécimaux.";
        return;
    }

    resultatReference.textContent =
        "Vérification en cours...";

    try {
        const empreinteCalculee =
            await calculerEmpreinte(fichier);

        if (empreinteCalculee === empreinteAttendue) {
            resultatReference.textContent =
                "CORRESPONDANCE : le contenu du fichier correspond à l'empreinte de référence.";
        } else {
            resultatReference.textContent =
                "ABSENCE DE CORRESPONDANCE : le contenu du fichier diffère de celui représenté par l'empreinte de référence.";
        }
    } catch (erreur) {
        resultatReference.textContent =
            "Impossible de vérifier l'empreinte.";
        console.error(erreur);
    }
});

// ESPACE ETABLISSEMENT PROJET X

const formEtablissement = document.getElementById("formEtablissement");
console.log("PROJET X : JavaScript chargé");
console.log("Formulaire trouvé :", formEtablissement);
const messageEtablissement = document.getElementById(
    "messageEtablissement"
);

formEtablissement.addEventListener("submit", function (event) {

    // Empêche la page de se recharger
    event.preventDefault();

    // Récupération des informations saisies
    const nomEtablissement = document
        .getElementById("nomEtablissement")
        .value.trim();

    const nomTitulaire = document
        .getElementById("nomTitulaire")
        .value.trim();

    const nomFormation = document
        .getElementById("nomFormation")
        .value.trim();

    const referenceAttestation = document
        .getElementById("referenceAttestation")
        .value.trim();

    const dateDelivrance = document
        .getElementById("dateDelivrance")
        .value;

    // Vérification des champs
    if (
        !nomEtablissement ||
        !nomTitulaire ||
        !nomFormation ||
        !referenceAttestation ||
        !dateDelivrance
    ) {
        messageEtablissement.textContent =
            "Erreur : remplis tous les champs.";

        return;
    }

    // Récupération des attestations déjà enregistrées
    let attestations = [];

    try {
        attestations = JSON.parse(
            localStorage.getItem("projetX_attestations") || "[]"
        );

        if (!Array.isArray(attestations)) {
            attestations = [];
        }
    } catch (erreur) {
        messageEtablissement.textContent =
            "Impossible de lire les données enregistrées.";

        return;
    }

    // Vérification du numéro de référence
    const referenceExiste = attestations.some(function (attestation) {
        return (
            attestation.referenceAttestation.toLowerCase() ===
            referenceAttestation.toLowerCase()
        );
    });

    if (referenceExiste) {
        messageEtablissement.textContent =
            "Cette référence existe déjà. Choisis un autre numéro.";

        return;
    }

    // Création de la nouvelle attestation
    const nouvelleAttestation = {
        nomEtablissement: nomEtablissement,
        nomTitulaire: nomTitulaire,
        nomFormation: nomFormation,
        referenceAttestation: referenceAttestation,
        dateDelivrance: dateDelivrance
    };

    // Enregistrement local
    attestations.push(nouvelleAttestation);

    try {
        localStorage.setItem(
            "projetX_attestations",
            JSON.stringify(attestations)
        );
    } catch (erreur) {
        messageEtablissement.textContent =
            "Enregistrement impossible sur cet appareil.";

        return;
    }

    // Confirmation
messageEtablissement.textContent =
    "Attestation enregistrée pour la démonstration !";

// Afficher la zone du QR code
const zoneQR = document.getElementById("zoneQR");
const qrCode = document.getElementById("qrCode");
const referenceQR = document.getElementById("referenceQR");

if (zoneQR && qrCode && referenceQR) {

    // Afficher la zone QR
    zoneQR.hidden = false;

    // Effacer un éventuel ancien QR code
    qrCode.replaceChildren();

    // Afficher la référence de l'attestation
    referenceQR.textContent =
        "Référence : " + nouvelleAttestation.referenceAttestation;

    // Générer le QR code
    if (typeof QRCode !== "undefined") {

   new QRCode(qrCode, {
    text: window.location.origin +
        "/verification.html?reference=" +
        encodeURIComponent(
            nouvelleAttestation.referenceAttestation
        ),
    width: 180,
    height: 180,
    correctLevel: QRCode.CorrectLevel.M
});

    } else {
        qrCode.textContent =
            "Impossible de générer le QR code. Vérifie ta connexion Internet.";
    }
}

// Réinitialisation du formulaire
formEtablissement.reset();

console.log("Attestation enregistrée :", nouvelleAttestation);
});
// ESPACE RECRUTEUR PROJET X

const formRecruteur = document.getElementById("formRecruteur");

const rechercheReference = document.getElementById(
    "rechercheReference"
);

const resultatRecruteur = document.getElementById(
    "resultatRecruteur"
);

formRecruteur.addEventListener("submit", function (event) {

    // Empêcher le rechargement de la page
    event.preventDefault();

    // Récupérer la référence saisie
    const referenceRecherchee = rechercheReference.value
        .trim()
        .toLowerCase();

    // Afficher la zone de résultat
    resultatRecruteur.hidden = false;

    // Lire les attestations enregistrées
    let attestations = [];

    try {
        attestations = JSON.parse(
            localStorage.getItem("projetX_attestations") || "[]"
        );

        if (!Array.isArray(attestations)) {
            attestations = [];
        }
    } catch (erreur) {
        resultatRecruteur.textContent =
            "Impossible de lire les attestations enregistrées.";
        return;
    }

    // Rechercher la référence
    const attestationTrouvee = attestations.find(
        function (attestation) {
            return (
                typeof attestation.referenceAttestation === "string" &&
                attestation.referenceAttestation.toLowerCase() ===
                referenceRecherchee
            );
        }
    );

    // Si aucune attestation ne correspond
    if (!attestationTrouvee) {
        resultatRecruteur.textContent =
            "Aucune attestation trouvée pour cette référence.";
        return;
    }

    // Créer le résultat de manière sécurisée
    resultatRecruteur.replaceChildren();

    const titre = document.createElement("h3");
    titre.textContent = "Attestation retrouvée";

    resultatRecruteur.appendChild(titre);

    const informations = [
        ["Établissement", attestationTrouvee.nomEtablissement],
        ["Titulaire", attestationTrouvee.nomTitulaire],
        ["Formation", attestationTrouvee.nomFormation],
        ["Référence", attestationTrouvee.referenceAttestation],
        ["Date de délivrance", attestationTrouvee.dateDelivrance]
    ];

    informations.forEach(function (information) {
        const paragraphe = document.createElement("p");
        const etiquette = document.createElement("strong");

        etiquette.textContent = information[0] + " : ";

        paragraphe.appendChild(etiquette);
        paragraphe.appendChild(
            document.createTextNode(information[1] || "")
        );

        resultatRecruteur.appendChild(paragraphe);
    });

    const avertissement = document.createElement("p");

    avertissement.textContent =
        "Attention : cette référence a été retrouvée dans les données locales. " +
        "Cela ne confirme pas encore l'authenticité du document ni l'identité de l'établissement.";

    resultatRecruteur.appendChild(avertissement);

});

// TABLEAU DE BORD PROJET X

const totalAttestations = document.getElementById(
    "totalAttestations"
);

const totalFormations = document.getElementById(
    "totalFormations"
);

const dernieresAttestations = document.getElementById(
    "dernieresAttestations"
);

const actualiserDashboard = document.getElementById(
    "actualiserDashboard"
);

const messageDashboard = document.getElementById(
    "messageDashboard"
);


// Charger les attestations enregistrées
function chargerDashboard() {

    let attestations = [];

    try {
        attestations = JSON.parse(
            localStorage.getItem("projetX_attestations") || "[]"
        );

        if (!Array.isArray(attestations)) {
            attestations = [];
        }
    } catch (erreur) {
        totalAttestations.textContent = "—";
        totalFormations.textContent = "—";

        dernieresAttestations.textContent =
            "Impossible de lire les données enregistrées.";

        messageDashboard.textContent =
            "Une erreur est survenue lors du chargement.";

        return;
    }

    // Calculer le nombre d'attestations
    totalAttestations.textContent = attestations.length;

    // Compter les formations différentes
    const formations = new Set(
        attestations
            .map(function (attestation) {
                return typeof attestation.nomFormation === "string"
                    ? attestation.nomFormation.trim().toLowerCase()
                    : "";
            })
            .filter(Boolean)
    );

    totalFormations.textContent = formations.size;

    // Afficher les dernières attestations
    dernieresAttestations.replaceChildren();

    if (attestations.length === 0) {
        const message = document.createElement("p");

        message.className = "attestation-empty";
        message.textContent =
            "Aucune attestation enregistrée pour le moment.";

        dernieresAttestations.appendChild(message);
        messageDashboard.textContent = "";

        return;
    }

    const dernieres = attestations.slice(-5).reverse();

    dernieres.forEach(function (attestation) {

        const carte = document.createElement("article");
        carte.className = "attestation-card";

        const nom = document.createElement("p");
        const formation = document.createElement("p");
        const reference = document.createElement("p");
        const date = document.createElement("p");

        nom.textContent =
            "Titulaire : " + (attestation.nomTitulaire || "Non renseigné");

        formation.textContent =
            "Formation : " + (attestation.nomFormation || "Non renseignée");

        reference.textContent =
            "Référence : " +
            (attestation.referenceAttestation || "Non renseignée");

        date.textContent =
            "Date : " + (attestation.dateDelivrance || "Non renseignée");

        carte.append(nom, formation, reference, date);

        dernieresAttestations.appendChild(carte);
    });

    messageDashboard.textContent =
        "Statistiques calculées à partir des données locales.";
}


// Actualiser au clic
actualiserDashboard.addEventListener(
    "click",
    chargerDashboard
);


// Charger à l'ouverture de la page
chargerDashboard();