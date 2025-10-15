// Declaración de variables
const apiUrl = 'https://digimon-api.vercel.app/api/digimon';
const digimonList = document.querySelector('.digimon-list ul');
const digimonDetails = document.querySelector('.digimon-details .digimon');

// Le hacemos fetch a la API y mostramos la lista de Digimons
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    try {
      data.sort((a, b) => (a.name > b.name) ? 1 : -1);
      for (let digimon of data) {
        const li = document.createElement('li');
        li.textContent = digimon.name;
        li.addEventListener('click', () => {
          showDigimonDetails(digimon);
        });
        digimonList.appendChild(li);
      }
    } catch(error) {
      console.error(error);
    }
  });

// Muestra los detalles de un Digimon en específico
function showDigimonDetails(digimon) {
  digimonDetails.innerHTML = `
    <h4>${digimon.name}</h4>
    <img src="${digimon.img}" alt="${digimon.name}">
    <p><strong>Nivel:</strong> ${digimon.level}</p>
  `;
}
