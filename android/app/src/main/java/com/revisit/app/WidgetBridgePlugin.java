package com.revisit.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    private static String pendingSharedUrl = null;

    public static void setPendingSharedUrl(String url) {
        pendingSharedUrl = url;
    }

    @PluginMethod
    public void getSharedLink(PluginCall call) {
        JSObject ret = new JSObject();
        if (pendingSharedUrl != null) {
            ret.put("url", pendingSharedUrl);
            pendingSharedUrl = null;
        } else {
            ret.put("url", null);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        String data = call.getString("data");
        if (data == null) {
            call.reject("Data parameter is required");
            return;
        }

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("revisit_widget_prefs", Context.MODE_PRIVATE);
        prefs.edit().putString("widget_links", data).apply();

        reloadAllWidgets(context);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void reloadWidgets(PluginCall call) {
        Context context = getContext();
        reloadAllWidgets(context);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    private void reloadAllWidgets(Context context) {
        try {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);

            ComponentName smallWidget = new ComponentName(context, SmallWidgetProvider.class);
            int[] smallIds = manager.getAppWidgetIds(smallWidget);
            if (smallIds != null && smallIds.length > 0) {
                Intent smallIntent = new Intent(context, SmallWidgetProvider.class);
                smallIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                smallIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, smallIds);
                context.sendBroadcast(smallIntent);
                for (int id : smallIds) {
                    SmallWidgetProvider.updateAppWidget(context, manager, id);
                }
            }

            ComponentName mediumWidget = new ComponentName(context, MediumWidgetProvider.class);
            int[] mediumIds = manager.getAppWidgetIds(mediumWidget);
            if (mediumIds != null && mediumIds.length > 0) {
                Intent mediumIntent = new Intent(context, MediumWidgetProvider.class);
                mediumIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                mediumIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, mediumIds);
                context.sendBroadcast(mediumIntent);
                for (int id : mediumIds) {
                    MediumWidgetProvider.updateAppWidget(context, manager, id);
                }
                manager.notifyAppWidgetViewDataChanged(mediumIds, R.id.widget_medium_list);
            }
        } catch (Exception ignored) {}
    }
}
