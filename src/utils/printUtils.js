export function imprimirEscopo(classeEscopo = 'print-scope') {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const body = document.body;
  body.classList.add('print-scope-active');
  body.setAttribute('data-print-scope', classeEscopo);

  const limpar = () => {
    body.classList.remove('print-scope-active');
    body.removeAttribute('data-print-scope');
  };

  window.addEventListener('afterprint', limpar, { once: true });

  setTimeout(() => {
    window.print();
    setTimeout(limpar, 1200);
  }, 50);
}
