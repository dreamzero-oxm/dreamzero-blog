---
title: 魔数
description: 魔数
date: 2022-07-28
slug: 
image: 
categories:
    - 其他
    - 软件技能
tags:
    - 其他
    - 软件技能
    - 魔数
updated: 2022-07-28
comments: false
---
# 通过魔数判断文件类型

## FileTypeEnum 枚举类

```java
/**
 * @author MOITY
 */
public enum FileTypeEnum {

    /** JPEG  (jpg)*/
    JPEG("JPG", "FFD8FF"),

    /** PNG */
    PNG("PNG", "89504E47"),

    /** GIF */
    GIF("GIF", "47494638"),

    /** TIFF (tif)  */
    TIFF("TIF", "49492A00"),

    /** Windows bitmap (bmp) */
    BMP("BMP","424D"),

    //16色位图(bmp)
    BMP_16("BMP","424D228C010000000000"),

    //24位位图(bmp)
    BMP_24("BMP","424D8240090000000000"),

    //256色位图(bmp)
    BMP_256("BMP","424D8E1B030000000000"),

    /** CAD  (dwg) */
    DWG("DWG", "41433130"),

    /** Adobe photoshop  (psd)*/
    PSD("PSD", "38425053"),

    /** Rich Text Format  (rtf)*/
    RTF("RTF", "7B5C727466"),

    /** XML */
    XML("XML", "3C3F786D6C"),

    /** HTML (html)*/
    HTML("HTML", "68746D6C3E"),

    /** Email [thorough only] (eml)*/
    EML("EML", "44656C69766572792D646174653A"),

    /** Outlook Express (dbx) */
    DBX("DBX", "CFAD12FEC5FD746F "),

    /** Outlook (pst)*/
    PST("", "2142444E"),

    /** doc;xls;dot;ppt;xla;ppa;pps;pot;msi;sdw;db */
    OLE2("OLE2", "0xD0CF11E0A1B11AE1"),

    /** Microsoft Word/Excel 注意：word 和 excel的文件头一样 */
    XLS("XLS", "D0CF11E0"),

    /** Microsoft Word/Excel 注意：word 和 excel的文件头一样 */
    DOC("DOC", "D0CF11E0"),

    /** Microsoft Word/Excel 2007以上版本文件 注意：word 和 excel的文件头一样 */
    DOCX("DOCX", "504B0304"),

    /** Microsoft Word/Excel 2007以上版本文件 注意：word 和 excel的文件头一样 504B030414000600080000002100*/
    XLSX("XLSX", "504B0304"),

    /** Microsoft Access (mdb)*/
    MDB("MDB", "5374616E64617264204A"),

    /** Word Perfect (wpd)*/
    WPB("WPB", "FF575043"),

    /** Postscript */
    EPS("EPS", "252150532D41646F6265"),

    /** Postscript */
    PS("PS", "252150532D41646F6265"),

    /** Adobe Acrobat (pdf)  */
    PDF("PDF", "255044462D312E"),

    /** Quicken (qdf) */
    QDF("qdf", "AC9EBD8F"),

    /** QuickBooks Backup (qdb) */
    QDB("qbb", "458600000600"),

    /** Windows Password  (pwl)*/
    PWL("PWL", "E3828596"),

    /** ZIP Archive */
    ZIP("", "504B0304"),

    /** ARAR Archive */
    RAR("", "52617221"),

    /** WAVE (wav) */
    WAV("WAV", "57415645"),

    /** AVI */
    AVI("AVI", "41564920"),

    /** Real Audio (ram)*/
    RAM("RAM", "2E7261FD"),

    /** Real Media (rm) rmvb/rm相同  */
    RM("RM", "2E524D46"),

    /** Real Media (rm) rmvb/rm相同  */
    RMVB("RMVB", "2E524D46000000120001"),

    /** MPEG (mpg)  */
    MPG("MPG", "000001BA"),

    /** Quicktime  (mov)*/
    MOV("MOV", "6D6F6F76"),

    /** Windows Media (asf) */
    ASF("ASF", "3026B2758E66CF11"),

    /** ARJ Archive */
    ARJ("ARJ", "60EA"),

    /** MIDI (mid) */
    MID("MID", "4D546864"),

    /** MP4 */
    MP4("MP4", "00000020667479706D70"),

    /** MP3 */
    MP3("MP3", "49443303000000002176"),

    /** FLV */
    FLV("FLV", "464C5601050000000900"),

    /** 1F8B0800000000000000 */
    GZ("GZ", "1F8B08"),

    /** CSS */
    CSS("CSS", "48544D4C207B0D0A0942"),

    /**  JS */
    JS("JS", "696B2E71623D696B2E71"),

    /**  Visio */
    VSD("VSD", "d0cf11e0a1b11ae10000"),

    /** WPS文字wps、表格et、演示dps都是一样的 */
    WPS("WPS", "d0cf11e0a1b11ae10000"),

    /** torrent */
    TORRENT("TORRENT", "6431303A637265617465"),

    /** JSP Archive */
    JSP("JSP", "3C2540207061676520"),

    /** JAVA Archive */
    JAVA("JAVA", "7061636B61676520"),

    /** CLASS Archive */
    CLASS("CLASS", "CAFEBABE0000002E00"),

    /** JAR Archive */
    JAR("JAR", "504B03040A000000"),

    /** MF Archive */
    MF("MF", "4D616E69666573742D56"),

    /** EXE Archive */
    EXE("EXE", "4D5A9000030000000400"),

    /** ELF Executable */
    ELF("ELF", "7F454C4601010100"),

    /** Lotus 123 v1 */
    WK1("WK1", "2000604060"),

    /** Lotus 123 v3 */
    WK3("WK3", "00001A0000100400"),

    /** Lotus 123 v5 */
    WK4("WK4", "00001A0002100400"),

    /** Lotus WordPro v9 */
    LWP("LWP", "576F726450726F"),

    /** Sage(sly.or.srt.or.slt;sly;srt;slt) */
    SLY("SLY", "53520100"),

    /** CHM Archive */
   /* CHM("CHM", "49545346030000006000"),
    INI("INI", "235468697320636F6E66"),
    SQL("SQL", "494E5345525420494E54"),
    BAT("BAT", "406563686F206f66660D"),
    PROPERTIES("", "6C6F67346A2E726F6F74"),
    MXP("", "04000000010000001300"),  */

    NOT_EXITS_ENUM("", "");

    /**
     * 文件类型对应的名称
     */
    private String fileTypeName;


    private String magicNumberCode;

    FileTypeEnum(String fileTypeName, String magicNumberCode) {
        this.fileTypeName = fileTypeName;
        this.magicNumberCode = magicNumberCode;
    }

    public String getFileTypeName() {
        return fileTypeName;
    }

    public String getMagicNumberCode() {
        return magicNumberCode;
    }


    /**
     * 根据文件类型获取文件类型魔数编码
     * 默认返回标准件
     * String的toUpperCase：返回一个新的字符串，其字母全大写
     * startsWith() 方法用于检测字符串是否以指定的前缀开始
     * @param magicNumberCode - 文件类型魔数编码
     * @return 标准件
     */
    public static FileTypeEnum getByMagicNumberCode(String magicNumberCode) {
        if (magicNumberCode != null) {
            for (FileTypeEnum type : values()) {
                if (magicNumberCode.toUpperCase().startsWith(type.getMagicNumberCode())) {
                    return type;
                }
            }
        }

        return FileTypeEnum.NOT_EXITS_ENUM;
    }

    /**
     * 根据文件类型后缀名获取枚举
     *
     * @param fileTypeName - 文件类型后缀名
     * @return 返回对应的枚举
     */
    public static FileTypeEnum getByFileTypeName(String fileTypeName) {
        if (fileTypeName != null) {
            for (FileTypeEnum type : values()) {
                if (type.getFileTypeName().equals(fileTypeName)) {
                    return type;
                }
            }
        }
        return FileTypeEnum.NOT_EXITS_ENUM;
    }

}
```

## FileTypeUtils工具类

```java

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

/**
 * 通过文件魔数来判断文件类型
 * 可以最大量避免通过后缀名来判断文件类型的漏洞
 *
 * @author MOITY
 */
public class FileTypeUtils {

    /**
     * 获取图片文件实际类型,若不是图片则返回null
     * @param file
     * @return fileType
     */
    public final static String getImageFileType(File file) {
        if (isImage(file)) {
            try {
                ImageInputStream iis = ImageIO.createImageInputStream(file);
                Iterator<ImageReader> iter = ImageIO.getImageReaders(iis);
                if (!iter.hasNext()) {
                    return null;
                }
                ImageReader reader = iter.next();
                iis.close();
                return reader.getFormatName();
            } catch (IOException e) {
                return null;
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    /**
     * 获取文件类型,包括图片,若格式不是已配置的,则返回null
     * @param file
     * @return fileType
     */
    public final static String getFileByFile(File file) {
        String filetype = null;
        byte[] b = new byte[50];
        try {
            InputStream is = new FileInputStream(file);
            is.read(b);
            filetype = getFileTypeByStream(b);
            is.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return filetype;
    }

    /**
     * 通过数据流（二进制数据）判断文件类型
     * @param b
     * @return fileType
     */
    public final static String getFileTypeByStream(byte[] b) {
        String magicNumberCode = String.valueOf(getFileHexString(b));

        if (magicNumberCode != null) {
            return FileTypeEnum.getByMagicNumberCode(magicNumberCode.toUpperCase()).getFileTypeName();

        }
        return FileTypeEnum.NOT_EXITS_ENUM.getFileTypeName();
    }

    /**
     * isImage,判断文件是否为图片
     * @param file
     * @return true 是 | false 否 
     */
    public static final boolean isImage(File file){
        boolean flag = false;
        try {
            BufferedImage bufreader = ImageIO.read(file);
            int width = bufreader.getWidth();
            int height = bufreader.getHeight();
            if(width==0 || height==0){
                flag = false;
            }else {
                flag = true;
            }
        } catch (IOException e) {
            flag = false;
        }catch (Exception e) {
            flag = false;
        }
        return flag;
    }


    /**
     * 通过文件路径判断文件类型
     * @param path
     * @return
     * @throws IOException
     */
    public static FileTypeEnum getFileTypeByPath(String path) {
        // 获取文件头
        String magicNumberCode = null;
        try {
            magicNumberCode = getFileHeader(path);
        } catch (Exception e) {
            e.printStackTrace();
            return FileTypeEnum.NOT_EXITS_ENUM;
        }

        if (magicNumberCode != null) {
            return FileTypeEnum.getByMagicNumberCode(magicNumberCode.toUpperCase());

        }

        return FileTypeEnum.NOT_EXITS_ENUM;
    }


    /**
     * 通过文件路径获取文件头（即文件魔数）
     * @param path
     * @return
     * @throws IOException
     */
    public static String getFileHeader(String path) throws Exception {
        byte[] b = new byte[28];
        InputStream inputStream = null;

        try {
            inputStream = new FileInputStream(path);
            inputStream.read(b, 0, 28);
        } finally {
            if (inputStream != null) {
                inputStream.close();
            }
        }

        return getFileHexString(b);
    }

    /**
     * 把文件二进制流转换成十六进制数据
     * @param b
     * @return fileTypeHex
     */
    public final static String getFileHexString(byte[] b) {
        StringBuilder builder = new StringBuilder();
        if (b == null || b.length <= 0) {
            return null;
        }

        for (int i = 0; i < b.length; i++) {
            int v = b[i] & 0xFF;
            String hv = Integer.toHexString(v);
            if (hv.length() < 2) {
                builder.append(0);
            }
            builder.append(hv);
        }
        return builder.toString();
    }
}
```

