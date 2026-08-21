import { db } from "./acs-db";
import type { Cidadao, ConfiguracoesLocais, Importacao, Visita } from "./domain";

type BackupLocal = {
  formato: "amigo-do-acs-backup";
  versao: 1;
  exportadoEm: string;
  cidadaos: Cidadao[];
  visitas: Visita[];
  importacoes: Importacao[];
  configuracoes: ConfiguracoesLocais[];
};

type BackupProtegido = {
  formato: "amigo-do-acs-backup-protegido";
  versao: 1;
  exportadoEm: string;
  sal: string;
  iv: string;
  dados: string;
};

function baixar(conteudo: string, nome: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(url);
}

function emBase64(valor: Uint8Array) {
  let texto = "";
  for (let indice = 0; indice < valor.length; indice += 1) texto += String.fromCharCode(valor[indice] ?? 0);
  return btoa(texto);
}

function deBase64(valor: string) {
  return Uint8Array.from(atob(valor), (item) => item.charCodeAt(0));
}

async function chaveDaSenha(senha: string, sal: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: sal as unknown as BufferSource, iterations: 210000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

async function montarBackup(): Promise<BackupLocal> {
  return {
    formato: "amigo-do-acs-backup",
    versao: 1,
    exportadoEm: new Date().toISOString(),
    cidadaos: await db.cidadaos.toArray(),
    visitas: await db.visitas.toArray(),
    importacoes: await db.importacoes.toArray(),
    configuracoes: await db.configuracoes.toArray(),
  };
}

export async function exportarBackupLocal(senha?: string) {
  const backup = await montarBackup();
  const data = new Date().toISOString().slice(0, 10);
  if (!senha) {
    baixar(JSON.stringify(backup, null, 2), `amigo-do-acs-backup-${data}.json`);
    return;
  }
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const chave = await chaveDaSenha(senha, sal);
  const criptografado = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as unknown as BufferSource }, chave, new TextEncoder().encode(JSON.stringify(backup)));
  const protegido: BackupProtegido = { formato: "amigo-do-acs-backup-protegido", versao: 1, exportadoEm: backup.exportadoEm, sal: emBase64(sal), iv: emBase64(iv), dados: emBase64(new Uint8Array(criptografado)) };
  baixar(JSON.stringify(protegido, null, 2), `amigo-do-acs-backup-protegido-${data}.json`);
}

export async function restaurarBackupLocal(arquivo: File, senha?: string) {
  const conteudo = JSON.parse(await arquivo.text()) as Partial<BackupLocal> | Partial<BackupProtegido>;
  let backup: Partial<BackupLocal>;
  if (conteudo.formato === "amigo-do-acs-backup-protegido") {
    if (!senha) throw new Error("Informe a senha usada para criar este backup protegido.");
    try {
      const chave = await chaveDaSenha(senha, deBase64(conteudo.sal ?? ""));
      const dados = await crypto.subtle.decrypt({ name: "AES-GCM", iv: deBase64(conteudo.iv ?? "") as unknown as BufferSource }, chave, deBase64(conteudo.dados ?? ""));
      backup = JSON.parse(new TextDecoder().decode(dados)) as Partial<BackupLocal>;
    } catch {
      throw new Error("Não foi possível abrir o backup protegido. Verifique a senha e o arquivo.");
    }
  } else {
    backup = conteudo as Partial<BackupLocal>;
  }
  if (backup.formato !== "amigo-do-acs-backup" || backup.versao !== 1 || !Array.isArray(backup.cidadaos) || !Array.isArray(backup.visitas)) {
    throw new Error("Este arquivo não é um backup compatível do Amigo do ACS.");
  }
  await db.transaction("rw", db.cidadaos, db.visitas, db.importacoes, db.configuracoes, async () => {
    await Promise.all([db.cidadaos.clear(), db.visitas.clear(), db.importacoes.clear(), db.configuracoes.clear()]);
    await db.cidadaos.bulkPut(backup.cidadaos as Cidadao[]);
    await db.visitas.bulkPut(backup.visitas as Visita[]);
    if (Array.isArray(backup.importacoes)) await db.importacoes.bulkPut(backup.importacoes as Importacao[]);
    if (Array.isArray(backup.configuracoes)) await db.configuracoes.bulkPut(backup.configuracoes as ConfiguracoesLocais[]);
  });
}
