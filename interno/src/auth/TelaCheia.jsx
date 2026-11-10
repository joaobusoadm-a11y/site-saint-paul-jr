// Tela de entrada (login, sem acesso, avisos): fundo areia com o ponto cortado no canto
export function TelaCheia({ titulo, children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-areia p-4 text-petroleo-escuro">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[18vmax] -top-[18vmax] h-[48vmax] w-[48vmax] rounded-full bg-petroleo"
      />
      <div className="relative w-full max-w-md rounded border border-linha bg-white p-6 text-preto sm:p-10">
        <img src="/spjr-logo.png" alt="Saint Paul Jr" className="h-10 w-auto" />
        {titulo && <h1 className="titulo mt-8">{titulo}</h1>}
        <div className="mt-4">{children}</div>
      </div>
    </main>
  );
}
