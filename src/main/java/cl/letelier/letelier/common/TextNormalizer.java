package cl.letelier.letelier.common;

import java.text.Normalizer;

public class TextNormalizer {
    public static String nfc(String s){
        if (s == null) return null;
        return Normalizer.normalize(s, Normalizer.Form.NFC);
    }
    public static String collapseSpaces(String s){
        if (s == null) return null;
        return s.trim().replaceAll("\\s+", " ");
    }
    public static String toLower(String s){
        return s == null ? null : s.toLowerCase();
    }
    public static String titleCaseEs(String s){
        if (s == null) return null;
        String in = collapseSpaces(nfc(toLower(s)));
        StringBuilder out = new StringBuilder(in.length());
        boolean cap = true;
        for (int i=0; i<in.length(); i++){
            char c = in.charAt(i);
            if (cap && Character.isLetter(c)) {
                out.append(Character.toTitleCase(c));
                cap = false;
            } else {
                out.append(c);
            }
            if (c==' ' || c=='-' || c=='\'' || c=='/') cap = true;
        }
        return out.toString();
    }
    public static String addressCase(String s){
        // En este proyecto, se decidió guardar en MAYÚSCULAS
        return upperEs(s);
    }

    public static String upperEs(String s){
        if (s == null) return null;
        // Usar locale español para Ñ/acentos correctos
        return nfc(s).toUpperCase(java.util.Locale.forLanguageTag("es-CL"));
    }
}
