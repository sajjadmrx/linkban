package com.revisit.app;

import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.concurrent.Executor;

@CapacitorPlugin(name = "BiometricAuth")
public class BiometricAuthPlugin extends Plugin {

    @PluginMethod
    public void isAvailable(PluginCall call) {
        BiometricManager biometricManager = BiometricManager.from(getContext());
        int canAuthenticate = biometricManager.canAuthenticate(
            BiometricManager.Authenticators.BIOMETRIC_STRONG | BiometricManager.Authenticators.DEVICE_CREDENTIAL
        );

        boolean available = (canAuthenticate == BiometricManager.BIOMETRIC_SUCCESS);
        JSObject result = new JSObject();
        result.put("available", available);
        result.put("status", canAuthenticate);
        call.resolve(result);
    }

    @PluginMethod
    public void authenticate(PluginCall call) {
        String title = call.getString("title", "ورود به صندوقچه مخفی");
        String subtitle = call.getString("subtitle", "برای مشاهده لینک‌های مخفی احراز هویت کنید");
        String negativeText = call.getString("cancelText", "انصراف");

        FragmentActivity activity = (FragmentActivity) getActivity();
        if (activity == null) {
            call.reject("Activity is null");
            return;
        }

        new Handler(Looper.getMainLooper()).post(() -> {
            try {
                Executor executor = ContextCompat.getMainExecutor(activity);
                BiometricPrompt biometricPrompt = new BiometricPrompt(activity, executor, new BiometricPrompt.AuthenticationCallback() {
                    @Override
                    public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                        super.onAuthenticationSucceeded(result);
                        JSObject res = new JSObject();
                        res.put("success", true);
                        call.resolve(res);
                    }

                    @Override
                    public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                        super.onAuthenticationError(errorCode, errString);
                        JSObject res = new JSObject();
                        res.put("success", false);
                        res.put("error", errString.toString());
                        res.put("code", errorCode);
                        call.resolve(res);
                    }

                    @Override
                    public void onAuthenticationFailed() {
                        super.onAuthenticationFailed();
                    }
                });

                BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
                    .setTitle(title)
                    .setSubtitle(subtitle)
                    .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG | BiometricManager.Authenticators.DEVICE_CREDENTIAL)
                    .build();

                biometricPrompt.authenticate(promptInfo);
            } catch (Exception e) {
                call.reject(e.getMessage());
            }
        });
    }
}
