// SoCialBr - Troca total de tema - 8 temas oficiais
const todosOsTemas = ['tema-original','tema-hardrock','tema-primaveril','tema-romantico','tema-darkzombie','tema-anos50','tema-anos60','tema-sertanejo'];

function aplicarNovoTema(nomeDoTema) {
  document.body.classList.remove(...todosOsTemas);
  if (nomeDoTema !== 'tema-original') document.body.classList.add(nomeDoTema);
  localStorage.setItem('socialbr-tema-salvo', nomeDoTema);
  // Atualiza visualmente qual cartão tá ativo
  document.querySelectorAll('[data-tema]').forEach(el=>el.classList.toggle('ativo', el.dataset.tema===nomeDoTema));
}

document.addEventListener('DOMContentLoaded', () => {
  const salvo = localStorage.getItem('socialbr-tema-salvo') || 'tema-original';
  aplicarNovoTema(salvo);

  // Um único ouvinte pra todos - não precisa configurar um por um
  document.body.addEventListener('click', (e)=>{
    const card = e.target.closest('[data-tema]');
    if(card){ e.preventDefault(); aplicarNovoTema(card.dataset.tema); }
  });
});
