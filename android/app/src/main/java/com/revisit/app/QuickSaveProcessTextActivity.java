package com.revisit.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.URI;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class QuickSaveProcessTextActivity extends Activity {

    private static final Pattern URL_PATTERN = Pattern.compile(
        "(?i)\\b((?:https?://|www\\d{0,3}[.]|[a-z0-9.\\-]+[.][a-z]{2,4}/)(?:[^\\s()<>]+|\\((?:[^\\s()<>]+|(\\([^\\s()<>]+\\)))*\\))+(?:\\((?:[^\\s()<>]+|(\\([^\\s()<>]+\\)))*\\)|[^\\s`!()\\[\\]{};:'\".,<>?«»“”‘’]))"
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        overridePendingTransition(0, 0);

        CharSequence selectedText = null;
        Intent intent = getIntent();
        if (intent != null) {
            selectedText = intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT);
            if (selectedText == null) {
                selectedText = intent.getStringExtra(Intent.EXTRA_TEXT);
            }
        }

        if (selectedText != null) {
            String url = extractUrl(selectedText.toString());
            if (url != null && !url.isEmpty()) {
                saveLink(url);
            } else {
                Toast.makeText(this, getString(R.string.toast_no_link_found), Toast.LENGTH_SHORT).show();
            }
        }

        finish();
        overridePendingTransition(0, 0);
    }

    private String extractUrl(String text) {
        if (text == null) return null;
        String trimmed = text.trim();
        Matcher matcher = URL_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            String found = matcher.group(1);
            if (!found.startsWith("http://") && !found.startsWith("https://")) {
                found = "https://" + found;
            }
            return found;
        }
        if ((trimmed.contains(".com") || trimmed.contains(".ir") || trimmed.contains(".org") || trimmed.contains(".net") || trimmed.contains(".io")) && !trimmed.contains(" ")) {
            if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
                return "https://" + trimmed;
            }
            return trimmed;
        }
        return null;
    }

    private void saveLink(String url) {
        try {
            String domain = extractDomain(url);
            String title = domain;
            long now = System.currentTimeMillis();

            SharedPreferences capPrefs = getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String existingJson = capPrefs.getString("revisit_saved_links", "[]");
            JSONArray linksArray = new JSONArray(existingJson != null ? existingJson : "[]");

            boolean alreadyExists = false;
            for (int i = 0; i < linksArray.length(); i++) {
                JSONObject item = linksArray.getJSONObject(i);
                if (url.equalsIgnoreCase(item.optString("url"))) {
                    alreadyExists = true;
                    break;
                }
            }

            if (!alreadyExists) {
                int defaultIntervalMinutes = 120;
                String settingsJson = capPrefs.getString("revisit_settings", null);
                if (settingsJson != null) {
                    try {
                        JSONObject setObj = new JSONObject(settingsJson);
                        defaultIntervalMinutes = setObj.optInt("defaultInterval", 120);
                    } catch (Exception ignored) {}
                }

                long nextReminderAt = defaultIntervalMinutes > 0 ? now + (defaultIntervalMinutes * 60 * 1000L) : 0;

                JSONObject newLink = new JSONObject();
                newLink.put("id", "link_" + now + "_" + (new Random().nextInt(9000) + 1000));
                newLink.put("url", url);
                newLink.put("title", title);
                newLink.put("domain", domain);
                newLink.put("faviconUrl", "https://www.google.com/s2/favicons?domain=" + domain + "&sz=64");
                newLink.put("createdAt", now);
                newLink.put("reminderInterval", defaultIntervalMinutes);
                newLink.put("nextReminderAt", nextReminderAt);
                newLink.put("isPaused", false);
                newLink.put("isDone", false);
                newLink.put("openCount", 0);
                newLink.put("notificationId", Math.abs((int) (now % Integer.MAX_VALUE)));

                JSONArray updatedArray = new JSONArray();
                updatedArray.put(newLink);
                for (int i = 0; i < linksArray.length(); i++) {
                    updatedArray.put(linksArray.get(i));
                }

                capPrefs.edit().putString("revisit_saved_links", updatedArray.toString()).apply();
                triggerHaptic();

                String message = getString(R.string.toast_saved, domain);
                Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, getString(R.string.toast_already_saved), Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Toast.makeText(this, getString(R.string.toast_save_error), Toast.LENGTH_SHORT).show();
        }
    }

    private String extractDomain(String url) {
        try {
            URI uri = new URI(url);
            String domain = uri.getHost();
            if (domain != null) {
                return domain.startsWith("www.") ? domain.substring(4) : domain;
            }
        } catch (Exception ignored) {}
        return url.replace("https://", "").replace("http://", "").split("/")[0];
    }

    private void triggerHaptic() {
        try {
            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createOneShot(35, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(35);
                }
            }
        } catch (Exception ignored) {}
    }
}
