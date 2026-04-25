export default function AbaFinanceiroPro() {
  return (
    <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6">
      <h2 className="text-xl font-black text-slate-800">Financeiro</h2>
      <p className="mt-2 text-sm text-slate-500">
        Financeiro será habilitado após integração de pagamentos.
      </p>
      <p className="mt-4 text-xs font-semibold text-slate-400">
        TODO técnico: integração deve ser feita com backend; o backend deve criar sessão/cobrança; o frontend apenas redireciona ou confirma pagamento conforme resposta do backend.
      </p>
    </section>
  );
}
