import "fake-indexeddb/auto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "../client/src/lib/acs-db.ts";
import { importarArquivo } from "../client/src/lib/csv-import.ts";

const pasta = process.argv[2];
if (!pasta) throw new Error("Informe a pasta com os CSVs do PEC.");

await db.delete();
await db.open();

const nomes = (await readdir(pasta)).filter((nome) => nome.toLowerCase().endsWith(".csv")).sort();
const resultados = [];

for (const nome of nomes) {
  const conteudo = await readFile(path.join(pasta, nome));
  const arquivo = new File([conteudo], nome, { type: "text/csv" });
  resultados.push(await importarArquivo(arquivo));
}

const porLista = Object.fromEntries(resultados.map((item) => [item.listaTematica, { novos: item.novos, atualizados: item.atualizados, ignorados: item.ignorados }]));
console.log(JSON.stringify({ arquivosProcessados: resultados.length, listas: porLista, cidadaosConsolidados: await db.cidadaos.count() }, null, 2));

await db.delete();
