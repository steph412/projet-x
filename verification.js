// PROJET X — Vérification des attestations

const messageVerification = document.getElementById(
    "messageVerification"
);

const detailsAttestation = document.getElementById(
    "detailsAttestation"
);

// Récupérer la référence dans l'adresse de la page
const parametres = new URLSearchParams(
    window.location.search
);

const reference = parametres.get("reference");

// Récupérer les attestations enregistrées
const attestations = JSON.parse(
    localStorage.getItem("projetX_attestations") || "[]"
);

// Rechercher l'attestation correspondante
const attestation = attestations.find(function(item) {
    return item.referenceAttestation === reference;
});

// Afficher le résultat
if (!reference) {

    messageVerification.textContent =
        "Aucune référence n'a été fournie.";

} else if (!attestation) {

    messageVerification.textContent =
        "Attestation introuvable dans cette base de démonstration.";

} else {

    messageVerification.textContent =
        "Référence trouvée dans la base de démonstration.";

    const nom = document.createElement("p");
    nom.textContent =
        "Nom du titulaire : " + attestation.nomTitulaire;

    const etablissement = document.createElement("p");
    etablissement.textContent =
        "Établissement : " + attestation.nomEtablissement;

    const formation = document.createElement("p");
    formation.textContent =
        "Formation : " + attestation.nomFormation;

    const ref = document.createElement("p");
    ref.textContent =
        "Référence : " + attestation.referenceAttestation;

    detailsAttestation.appendChild(nom);
    detailsAttestation.appendChild(etablissement);
    detailsAttestation.appendChild(formation);
    detailsAttestation.appendChild(ref);
}