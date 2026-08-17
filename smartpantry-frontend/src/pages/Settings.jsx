import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

export default function Settings() {
    const [settings, setSettings] = useState({});

    const saveSettings = async (nextSettings = settings) => {
        try {
            const data = new FormData();
            Object.entries(nextSettings).forEach(([key, value]) => {
                if (key === 'profile_picture' && typeof value === 'string') return;
                if (value !== null && value !== undefined) {
                    data.append(key, typeof value === 'boolean' ? String(value) : value);
                }
            });
            await api.patch("/auth/settings/", data);
            return true;
        } catch (err) {
            console.error(err);
            alert("Could not save your privacy settings. Please try again.");
            return false;
        }
    };

    const toggleSetting = async (key) => {
        const nextSettings = {
            ...settings,
            [key]: !settings[key],
        };

        setSettings(nextSettings);
        await saveSettings(nextSettings);
    };

    useEffect(() => {
        api.get("/auth/settings/")
            .then((res) => setSettings(res.data))
            .catch((err) => {
                console.error(err);
                alert("Unable to load your settings right now.");
            });
    }, []);

    return (
        <div className="sp-donations">
            <div className="sp-app-layout">
            <Sidebar active="settings" />

            <main className="sp-settings-main">
                <div className="sp-page-head">
                    <div className="sp-freshness-bar" style={{ margin: '0 auto 20px' }}><span></span><span></span><span></span></div>
                    <h1>Privacy & Security Settings</h1>
                    <p>Choose how SmartPantry handles your account, privacy, and notifications.</p>
                </div>

                <section className="sp-settings-card">
                    <div className="sp-settings-item">
                        <div>
                            <h2>Profile</h2>
                            <p>Update your name and profile picture.</p>
                        </div>
                    </div>
                    <div className="sp-form-field">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={settings.full_name || ''}
                            onChange={(e) => setSettings((s) => ({ ...s, full_name: e.target.value }))}
                        />
                    </div>
                    <div className="sp-form-field">
                        <label>Profile Picture</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSettings((s) => ({ ...s, profile_picture: e.target.files[0] }))}
                        />
                        {settings.profile_picture && typeof settings.profile_picture === 'string' && (
                            <img
                                src={settings.profile_picture}
                                alt="Current profile"
                                style={{ marginTop: 8, width: 64, height: 64, objectFit: 'cover', borderRadius: '50%' }}
                            />
                        )}
                    </div>

                    <div className="sp-settings-item">
                        <div>
                            <h2>Two-Factor Authentication</h2>
                            <p>Add an extra step when logging in with OTP.</p>
                        </div>
                        <div className="sp-2fa-toggle sp-settings-toggle">
                            <span>Enable</span>
                            <button
                                type="button"
                                className={`sp-switch ${settings.is_2fa_enabled ? 'on' : ''}`}
                                aria-pressed={!!settings.is_2fa_enabled}
                                aria-label="Enable two-factor authentication"
                                onClick={() => toggleSetting('is_2fa_enabled')}
                            />
                        </div>
                    </div>

                    <div className="sp-settings-item">
                        <div>
                            <h2>Public Food Listings</h2>
                            <p>Let other users see your donation listings.</p>
                        </div>
                        <div className="sp-2fa-toggle sp-settings-toggle">
                            <span>Enable</span>
                            <button
                                type="button"
                                className={`sp-switch ${settings.is_donations_public ? 'on' : ''}`}
                                aria-pressed={!!settings.is_donations_public}
                                aria-label="Make food listings public"
                                onClick={() => toggleSetting('is_donations_public')}
                            />
                        </div>
                    </div>

                    <div className="sp-settings-item">
                        <div>
                            <h2>Email Notifications</h2>
                            <p>Receive updates about important pantry activity.</p>
                        </div>
                        <div className="sp-2fa-toggle sp-settings-toggle">
                            <span>Enable</span>
                            <button
                                type="button"
                                className={`sp-switch ${settings.email_notifications ? 'on' : ''}`}
                                aria-pressed={!!settings.email_notifications}
                                aria-label="Enable email notifications"
                                onClick={() => toggleSetting('email_notifications')}
                            />
                        </div>
                    </div>

                    <div className="sp-settings-item">
                        <div>
                            <h2>Push Notifications</h2>
                            <p>Show live updates while you use the app.</p>
                        </div>
                        <div className="sp-2fa-toggle sp-settings-toggle">
                            <span>Enable</span>
                            <button
                                type="button"
                                className={`sp-switch ${settings.push_notifications ? 'on' : ''}`}
                                aria-pressed={!!settings.push_notifications}
                                aria-label="Enable push notifications"
                                onClick={() => toggleSetting('push_notifications')}
                            />
                        </div>
                    </div>

                    <div className="sp-settings-actions">
                        <button type="button" className="sp-btn sp-btn-primary" onClick={() => saveSettings()}>
                            Save Changes
                        </button>
                    </div>
                </section>
            </main>
            </div>
        </div>
    );
}