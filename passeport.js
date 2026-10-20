// PROJET X — PASSEPORT DE COMPÉTENCES

const champNom = document.getElementById("nom");
const champObjectif = document.getElementById("objectif");
const champCompetence = document.getElementById("competence");
const champStatut = document.getElementById("statut");
const champPreuve = document.getElementById("preuve");

const boutonAjouter = document.getElementById("ajouter");
const resultats = document.getElementById("resultats");

let competences = JSON.parse(
    localStorage.getItem("projetX_passeport") || "[]"
);

function afficherCompetences() {
    resultats.innerHTML = "";

    if (competences.length === 0) {
        resultats.innerHTML =
            "<p>Aucune compétence ajoutée pour le moment.</p>";
        return;
    }

    competences.forEach(function (competence, index) {
        const carte = document.createElement("article");
        carte.className = "card";

        const titre = document.createElement("h3");
        titre.textContent = competence.nom;

        const statut = document.createElement("p");

        const statuts = {
            declaree: "Déclarée par l'utilisateur",
            evaluee: "Évaluée",
            confirmee: "Confirmée par un organisme"
        };

        statut.textContent =
            "Statut : " + (statuts[competence.statut] || competence.statut);

        const preuve = document.createElement("p");
        preuve.textContent =
            "Description ou preuve : " + competence.preuve;

        const supprimer = document.createElement("button");
        supprimer.textContent = "Supprimer";
        supprimer.type = "button";

        supprimer.addEventListener("click", function () {
            competences.splice(index, 1);
            sauvegarderCompetences();
            afficherCompetences();
        });

        carte.appendChild(titre);
        carte.appendChild(statut);
        carte.appendChild(preuve);
        carte.appendChild(supprimer);

        resultats.appendChild(carte);
    });
}

function sauvegarderCompetences() {
    localStorage.setItem(
        "projetX_passeport",
        JSON.stringify(competences)
    );
}

boutonAjouter.addEventListener("click", function () {
    const nom = champCompetence.value.trim();
    const statut = champStatut.value;
    const preuve = champPreuve.value.trim();

    if (nom === "") {
        alert("Entre le nom de la compétence.");
        return;
    }

    competences.push({
        nom: nom,
        statut: statut,
        preuve: preuve
    });

    sauvegarderCompetences();
    afficherCompetences();

    champCompetence.value = "";
    champPreuve.value = "";
});

function enregistrerProfil() {
    localStorage.setItem(
        "projetX_profil",
        JSON.stringify({
            nom: champNom.value.trim(),
            objectif: champObjectif.value.trim()
        })
    );
}

champNom.addEventListener("change", enregistrerProfil);
champObjectif.addEventListener("change", enregistrerProfil);

const profilEnregistre = JSON.parse(
    localStorage.getItem("projetX_profil") || "{}"
);

champNom.value = profilEnregistre.nom || "";
champObjectif.value = profilEnregistre.objectif || "";

afficherCompetences();
// AFFICHER LES ATTESTATIONS DANS LE PASSEPORT

const zoneAttestations = document.getElementById("mesAttestations");

function afficherAttestations() {
    const attestations = JSON.parse(
        localStorage.getItem("projetX_attestations") || "[]"
    );

    zoneAttestations.replaceChildren();

    if (attestations.length === 0) {
        zoneAttestations.textContent =
            "Aucune attestation enregistrée pour le moment.";
        return;
    }

    attestations.slice().reverse().forEach(function (attestation) {
        const carte = document.createElement("article");
        carte.className = "card";

        const titre = document.createElement("h3");
        titre.textContent = attestation.nomFormation || "Formation";

        const etablissement = document.createElement("p");
        etablissement.textContent =
            "Établissement : " + (attestation.nomEtablissement || "Non renseigné");

        const titulaire = document.createElement("p");
        titulaire.textContent =
            "Titulaire : " + (attestation.nomTitulaire || "Non renseigné");

        const reference = document.createElement("p");
        reference.textContent =
            "Référence : " + (attestation.referenceAttestation || "Non renseignée");

        const date = document.createElement("p");
        date.textContent =
            "Date de délivrance : " + (attestation.dateDelivrance || "Non renseignée");
const boutonVerifier = document.createElement("button");
boutonVerifier.type = "button";
boutonVerifier.textContent = "Vérifier cette attestation";

boutonVerifier.addEventListener("click", function () {
    const reference = attestation.referenceAttestation;

    if (!reference) {
        alert("Aucune référence disponible pour cette attestation.");
        return;
    }

    window.location.href =
        "verification.html?reference=" +
        encodeURIComponent(reference);
});
        carte.append(
    titre,
    etablissement,
    titulaire,
    reference,
    date,
    boutonVerifier
);
        zoneAttestations.appendChild(carte);
    });
}

afficherAttestations();
