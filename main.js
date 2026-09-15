document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderizarMenu === 'function') {
    renderizarMenu();
  } else {
    console.error('Erro: A função renderizarMenu não foi encontrada.');
  }

  if (typeof carregarTelaEmBranco === 'function') {
    carregarTelaEmBranco();
  }
});