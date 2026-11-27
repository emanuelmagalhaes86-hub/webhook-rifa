export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { txid, amount } = req.query;

  if (!amount) {
    return res.status(400).json({ pago: false, status: 'missing_amount' });
  }

  try {
    const url = `https://mercadopago.com`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': APP_USR-8882432410460621-112711-925e048e3b2cb871b6ca0cca3674120c-3882436074
      }
    });

    const data = await response.json();
    const pagamentos = data.results || [];

    const trintaMinutosAtras = new Date(Date.now() - 30 * 60 * 1000);

    const encontrado = pagamentos.find((pag) => {
      const dataPagamento = new Date(pag.date_approved || pag.date_created);
      const mesmoValor = Number(pag.transaction_amount) === Number(amount);
      const recente = dataPagamento >= trintaMinutosAtras;

      const textoCompleto = JSON.stringify(pag).toUpperCase();
      const bateTxid = txid ? textoCompleto.includes(txid.toUpperCase()) : true;

      return mesmoValor && recente && bateTxid;
    });

    if (encontrado) {
      return res.status(200).json({
        pago: true,
        paid: true,
        status: 'approved',
        txid: txid
      });
    }

    return res.status(200).json({
      pago: false,
      paid: false,
      status: 'pending'
    });

  } catch (error) {
    return res.status(500).json({ pago: false, error: error.message });
  }
}
