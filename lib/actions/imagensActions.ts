"use server";

import { fotosService } from "@/services/fotosService";
import { revalidatePath } from "next/cache";

export async function uploadImagemAction(
  bucket: string,
  entidade_id: string,
  file: File
) {
  try {
    const { publicUrl } = await fotosService.uploadFoto(
      bucket,
      file,
      entidade_id
    );
    const registro = await fotosService.linkFotoToEntity(
      bucket,
      entidade_id,
      publicUrl
    );

    revalidatePath("/");
    return { success: true, url: publicUrl, id: registro.id }; // retorna também o id do registro
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao enviar imagem" };
  }
}

export async function deleteImagemAction(
  bucket: string,
  filePath: string,
  id: string
) {
  try {
    await fotosService.removeFoto(bucket, filePath, id); // <-- nome correto e parâmetros
    revalidatePath("/");
    return { success: true, message: "Imagem excluída" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao excluir imagem" };
  }
}
