package com.example.takura.media.application;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.zip.ZipInputStream;
import javax.imageio.ImageIO;
import org.apache.pdfbox.Loader;
import org.springframework.stereotype.Component;

@Component
public class AttachmentValidator {
    private static final long MAX_EXPANDED_XLSX = 50L * 1024 * 1024;
    private static final int MAX_ZIP_ENTRIES = 2_000;
    public Validation validate(String extension, byte[] bytes) {
        long maximum="mp4".equalsIgnoreCase(extension)?100L*1024*1024:10L*1024*1024;
        if (bytes.length == 0 || bytes.length > maximum) return Validation.reject("FILE_SIZE_INVALID");
        try {
            return switch (extension.toLowerCase(Locale.ROOT)) {
                case "jpg", "jpeg" -> image(bytes, Set.of("JPEG", "JPG"));
                case "png" -> image(bytes, Set.of("PNG"));
                case "webp" -> image(bytes, Set.of("WEBP"));
                case "pdf" -> pdf(bytes);
                case "xlsx" -> xlsx(bytes);
                case "mp4" -> mp4(bytes);
                default -> Validation.reject("FILE_TYPE_FORBIDDEN");
            };
        } catch (Exception invalid) { return Validation.reject("FILE_STRUCTURE_INVALID"); }
    }
    private Validation image(byte[] bytes,Set<String> allowed)throws IOException {
        try(var input=ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))){var readers=ImageIO.getImageReaders(input);if(!readers.hasNext())return Validation.reject("IMAGE_DECODE_FAILED");var reader=readers.next();try{String format=reader.getFormatName().toUpperCase(Locale.ROOT);if(!allowed.contains(format))return Validation.reject("SIGNATURE_MISMATCH");reader.setInput(input,true,true);int width=reader.getWidth(0),height=reader.getHeight(0);if(width<1||height<1||((long)width*height)>40_000_000L)return Validation.reject("IMAGE_BOUNDS_INVALID");BufferedImage decoded=reader.read(0);if(decoded==null)return Validation.reject("IMAGE_DECODE_FAILED");return new Validation(true,null,width,height,null);}finally{reader.dispose();}}
    }
    private Validation pdf(byte[] bytes)throws IOException {if(bytes.length<5||bytes[0]!='%'||bytes[1]!='P'||bytes[2]!='D'||bytes[3]!='F'||bytes[4]!='-')return Validation.reject("SIGNATURE_MISMATCH");try(var document=Loader.loadPDF(bytes)){int pages=document.getNumberOfPages();if(pages<1||pages>200)return Validation.reject("PDF_BOUNDS_INVALID");return Validation.ok();}}
    private Validation xlsx(byte[] bytes)throws IOException {if(bytes.length<4||bytes[0]!='P'||bytes[1]!='K')return Validation.reject("SIGNATURE_MISMATCH");long expanded=0;int entries=0;boolean workbook=false;try(var zip=new ZipInputStream(new ByteArrayInputStream(bytes))){for(var entry=zip.getNextEntry();entry!=null;entry=zip.getNextEntry()){entries++;if(entries>MAX_ZIP_ENTRIES)return Validation.reject("XLSX_BOMB_REJECTED");String name=entry.getName().toLowerCase(Locale.ROOT);if(name.endsWith("vbaproject.bin")||name.contains("activex")||name.endsWith(".exe")||name.endsWith(".dll"))return Validation.reject("XLSX_MACRO_REJECTED");if(name.equals("xl/workbook.xml"))workbook=true;byte[] buffer=new byte[8192];for(int read;(read=zip.read(buffer))!=-1;){expanded+=read;if(expanded>MAX_EXPANDED_XLSX)return Validation.reject("XLSX_BOMB_REJECTED");}}}return workbook?Validation.ok():Validation.reject("XLSX_STRUCTURE_INVALID");}
    private Validation mp4(byte[] bytes){if(bytes.length<16||bytes[4]!='f'||bytes[5]!='t'||bytes[6]!='y'||bytes[7]!='p')return Validation.reject("SIGNATURE_MISMATCH");for(int i=4;i+24<bytes.length;i++){if(bytes[i]=='m'&&bytes[i+1]=='v'&&bytes[i+2]=='h'&&bytes[i+3]=='d'){int version=bytes[i+4]&255;int base=i+8+(version==1?16:8);if(base+8>bytes.length)return Validation.reject("VIDEO_STRUCTURE_INVALID");long scale=u32(bytes,base),duration=version==1?u64(bytes,base+4):u32(bytes,base+4);if(scale<1)return Validation.reject("VIDEO_STRUCTURE_INVALID");long seconds=(duration+scale-1)/scale;if(seconds<1||seconds>120)return Validation.reject("VIDEO_DURATION_INVALID");return new Validation(true,null,null,null,(int)seconds);}}return Validation.reject("VIDEO_STRUCTURE_INVALID");}
    private static long u32(byte[] b,int p){return ((long)(b[p]&255)<<24)|((long)(b[p+1]&255)<<16)|((long)(b[p+2]&255)<<8)|(b[p+3]&255);}
    private static long u64(byte[] b,int p){long high=u32(b,p),low=u32(b,p+4);if((high&0x80000000L)!=0)return Long.MAX_VALUE;return (high<<32)|low;}
    public record Validation(boolean accepted,String rejectionCode,Integer width,Integer height,Integer durationSeconds){static Validation ok(){return new Validation(true,null,null,null,null);}static Validation reject(String code){return new Validation(false,code,null,null,null);}}
}
