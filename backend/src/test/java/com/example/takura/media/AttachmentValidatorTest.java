package com.example.takura.media;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.takura.media.application.AttachmentValidator;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import javax.imageio.ImageIO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.junit.jupiter.api.Test;

class AttachmentValidatorTest {
    private final AttachmentValidator validator = new AttachmentValidator();
    @Test void acceptsDecodedImageAndPdf() throws Exception {var image=new ByteArrayOutputStream();ImageIO.write(new BufferedImage(8,8,BufferedImage.TYPE_INT_RGB),"png",image);assertThat(validator.validate("png",image.toByteArray()).accepted()).isTrue();try(var pdf=new PDDocument()){pdf.addPage(new PDPage());var out=new ByteArrayOutputStream();pdf.save(out);assertThat(validator.validate("pdf",out.toByteArray()).accepted()).isTrue();}}
    @Test void rejectsDisguisedAndForbiddenFiles(){assertThat(validator.validate("pdf","not-pdf".getBytes()).rejectionCode()).isEqualTo("SIGNATURE_MISMATCH");assertThat(validator.validate("svg","<svg/>".getBytes()).rejectionCode()).isEqualTo("FILE_TYPE_FORBIDDEN");}
    @Test void rejectsMacroEnabledSpreadsheetStructure() throws Exception {var out=new ByteArrayOutputStream();try(var zip=new ZipOutputStream(out)){zip.putNextEntry(new ZipEntry("xl/workbook.xml"));zip.write("<workbook/>".getBytes());zip.closeEntry();zip.putNextEntry(new ZipEntry("xl/vbaProject.bin"));zip.write(new byte[]{1});zip.closeEntry();}assertThat(validator.validate("xlsx",out.toByteArray()).rejectionCode()).isEqualTo("XLSX_MACRO_REJECTED");}
    @Test void probesReviewedMp4DurationWithoutExecutingContent(){byte[] video=new byte[44];video[4]='f';video[5]='t';video[6]='y';video[7]='p';video[12]='m';video[13]='v';video[14]='h';video[15]='d';put32(video,28,1000);put32(video,32,120000);assertThat(validator.validate("mp4",video).durationSeconds()).isEqualTo(120);put32(video,32,121000);assertThat(validator.validate("mp4",video).rejectionCode()).isEqualTo("VIDEO_DURATION_INVALID");}
    private static void put32(byte[] bytes,int offset,int value){bytes[offset]=(byte)(value>>>24);bytes[offset+1]=(byte)(value>>>16);bytes[offset+2]=(byte)(value>>>8);bytes[offset+3]=(byte)value;}
}
