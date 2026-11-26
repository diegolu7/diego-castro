const form = document.querySelector('#quote');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  const name = fields.get('nombre').trim();
  const business = fields.get('negocio').trim();
  const idea = fields.get('idea').trim();
  for (const [field, value] of [['nombre', name], ['idea', idea]]) {
    if (value) continue;
    const input = form.elements.namedItem(field);
    input.setCustomValidity('Completá este campo para seguir.');
    input.reportValidity();
    return;
  }
  const lines = [`Hola Diego, soy ${name}.`];
  if (business) lines.push(`Mi negocio o proyecto es ${business}.`);
  lines.push(`Me interesa: ${fields.get('servicio')}.`, '', idea);
  const url = new URL('https://wa.me/5493875640494');
  url.searchParams.set('text', lines.join('\n'));
  window.location.assign(url.href);
});

form.addEventListener('input', (event) => event.target.setCustomValidity(''));

document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    form.elements.servicio.value = link.dataset.service;
  });
});
