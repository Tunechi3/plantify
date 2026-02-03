import React, { useState, useEffect } from 'react';
import '../Profilepage.css';
import API_URL from '../config';
import Navbar from '../components/Navbar';


const Profilepage = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  const [profileData, setProfileData] = useState({
    fullname: '',
    email: '',
    phone: '',
    avatar: '',
    bio: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    preferences: {
      newsletter: false,
      smsNotifications: false,
      emailNotifications: true,
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [sameAsBilling, setSameAsBilling] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.status) {
        setProfileData(result.data);
      } else {
        showMessage('error', result.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSameAsBilling = (checked) => {
    setSameAsBilling(checked);
    if (checked) {
      setProfileData(prev => ({
        ...prev,
        billingAddress: { ...prev.shippingAddress },
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setUploadingImage(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_URL}/api/users/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.status) {
        setProfileData(prev => ({
          ...prev,
          avatar: result.data.avatar,
        }));
        showMessage('success', 'Profile picture updated successfully');
      } else {
        showMessage('error', result.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      setImageFile(null);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();
      if (result.status) {
        showMessage('success', 'Profile updated successfully');
        setProfileData(result.data);
      } else {
        showMessage('error', result.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();
      if (result.status) {
        showMessage('success', 'Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        showMessage('error', result.message);
      }
    } catch (error) {
      showMessage('error', 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ecp-container">
        <div className="ecp-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="ecp-container">
      <div className="ecp-wrapper">
        <div className="ecp-header">
          <h1 className="ecp-title">My Account</h1>
          <p className="ecp-subtitle">Manage your profile and preferences</p>
        </div>

        {message.text && (
          <div className={`ecp-message ecp-message-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="ecp-tabs">
          <button
            className={`ecp-tab ${activeTab === 'personal' ? 'ecp-tab-active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button
            className={`ecp-tab ${activeTab === 'address' ? 'ecp-tab-active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            Addresses
          </button>
          <button
            className={`ecp-tab ${activeTab === 'security' ? 'ecp-tab-active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`ecp-tab ${activeTab === 'preferences' ? 'ecp-tab-active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </div>

        <div className="ecp-content">
          {activeTab === 'personal' && (
            <div className="ecp-section">
              <h2 className="ecp-section-title">Personal Information</h2>
              
              <div className="ecp-avatar-section">
                <div className="ecp-avatar">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Profile" className="ecp-avatar-img" />
                  ) : (
                    <div className="ecp-avatar-placeholder">
                      {profileData.fullname.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ecp-avatar-info">
                  <p className="ecp-avatar-label">Profile Picture</p>
                  <div className="ecp-avatar-upload-container">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="ecp-file-input"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="avatar-upload" className="ecp-upload-btn">
                      {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    </label>
                    {profileData.avatar && (
                      <button
                        onClick={() => handleInputChange(null, 'avatar', '')}
                        className="ecp-remove-btn"
                        type="button"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="ecp-upload-hint">JPG, PNG or GIF (Max 5MB)</p>
                </div>
              </div>

              <div className="ecp-form-grid">
                <div className="ecp-form-group">
                  <label className="ecp-label">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullname}
                    onChange={(e) => handleInputChange(null, 'fullname', e.target.value)}
                    className="ecp-input"
                  />
                </div>

                <div className="ecp-form-group">
                  <label className="ecp-label">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="ecp-input ecp-input-disabled"
                  />
                </div>

                <div className="ecp-form-group">
                  <label className="ecp-label">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange(null, 'phone', e.target.value)}
                    className="ecp-input"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="ecp-form-group ecp-form-group-full">
                  <label className="ecp-label">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange(null, 'bio', e.target.value)}
                    className="ecp-textarea"
                    rows="4"
                    maxLength="500"
                    placeholder="Tell us a bit about yourself..."
                  />
                  <span className="ecp-char-count">{profileData.bio.length}/500</span>
                </div>
              </div>

              <button onClick={handleSaveProfile} disabled={saving} className="ecp-btn ecp-btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="ecp-section">
              <h2 className="ecp-section-title">Shipping Address</h2>
              <div className="ecp-form-grid">
                <div className="ecp-form-group ecp-form-group-full">
                  <label className="ecp-label">Street Address</label>
                  <input
                    type="text"
                    value={profileData.shippingAddress.street}
                    onChange={(e) => handleInputChange('shippingAddress', 'street', e.target.value)}
                    className="ecp-input"
                  />
                </div>

                <div className="ecp-form-group">
                  <label className="ecp-label">City</label>
                  <input
                    type="text"
                    value={profileData.shippingAddress.city}
                    onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                    className="ecp-input"
                  />
                </div>

                <div className="ecp-form-group">
                  <label className="ecp-label">State/Province</label>
                  <input
                    type="text"
                    value={profileData.shippingAddress.state}
                    onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                    className="ecp-input"
                  />
                </div>

                <div className="ecp-form-group">
                  <label className="ecp-label">Zip/Postal Code</label>
                  <input
                    type="text"
                    value={profileData.shippingAddress.zipCode}
                    onChange={(e) => handleInputChange('shippingAddress', 'zipCode', e.target.value)}
                    className="ecp-input"
                  />
                </div>

                <div className="ecp-form-group">
                  <label className="ecp-label">Country</label>
                  <input
                    type="text"
                    value={profileData.shippingAddress.country}
                    onChange={(e) => handleInputChange('shippingAddress', 'country', e.target.value)}
                    className="ecp-input"
                  />
                </div>
              </div>

              <div className="ecp-divider"></div>

              <div className="ecp-checkbox-group">
                <input
                  type="checkbox"
                  id="sameAsBilling"
                  checked={sameAsBilling}
                  onChange={(e) => handleSameAsBilling(e.target.checked)}
                  className="ecp-checkbox"
                />
                <label htmlFor="sameAsBilling" className="ecp-checkbox-label">
                  Billing address same as shipping
                </label>
              </div>

              {!sameAsBilling && (
                <>
                  <h2 className="ecp-section-title">Billing Address</h2>
                  <div className="ecp-form-grid">
                    <div className="ecp-form-group ecp-form-group-full">
                      <label className="ecp-label">Street Address</label>
                      <input
                        type="text"
                        value={profileData.billingAddress.street}
                        onChange={(e) => handleInputChange('billingAddress', 'street', e.target.value)}
                        className="ecp-input"
                      />
                    </div>

                    <div className="ecp-form-group">
                      <label className="ecp-label">City</label>
                      <input
                        type="text"
                        value={profileData.billingAddress.city}
                        onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                        className="ecp-input"
                      />
                    </div>

                    <div className="ecp-form-group">
                      <label className="ecp-label">State/Province</label>
                      <input
                        type="text"
                        value={profileData.billingAddress.state}
                        onChange={(e) => handleInputChange('billingAddress', 'state', e.target.value)}
                        className="ecp-input"
                      />
                    </div>

                    <div className="ecp-form-group">
                      <label className="ecp-label">Zip/Postal Code</label>
                      <input
                        type="text"
                        value={profileData.billingAddress.zipCode}
                        onChange={(e) => handleInputChange('billingAddress', 'zipCode', e.target.value)}
                        className="ecp-input"
                      />
                    </div>

                    <div className="ecp-form-group">
                      <label className="ecp-label">Country</label>
                      <input
                        type="text"
                        value={profileData.billingAddress.country}
                        onChange={(e) => handleInputChange('billingAddress', 'country', e.target.value)}
                        className="ecp-input"
                      />
                    </div>
                  </div>
                </>
              )}

              <button onClick={handleSaveProfile} disabled={saving} className="ecp-btn ecp-btn-primary">
                {saving ? 'Saving...' : 'Save Addresses'}
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="ecp-section">
              <h2 className="ecp-section-title">Change Password</h2>
              
              <div className="ecp-form-grid">
                <div className="ecp-form-group ecp-form-group-full">
                  <label className="ecp-label">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="ecp-input"
                  />
                </div>

                <div className="ecp-form-group">
                  <label className="ecp-label">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="ecp-input"
                  />
                </div>

                <div className="ecp-form-group">
                  <label className="ecp-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="ecp-input"
                  />
                </div>
              </div>

              <button onClick={handleChangePassword} disabled={saving} className="ecp-btn ecp-btn-primary">
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="ecp-section">
              <h2 className="ecp-section-title">Notification Preferences</h2>
              
              <div className="ecp-preferences">
                <div className="ecp-preference-item">
                  <div className="ecp-preference-info">
                    <h3 className="ecp-preference-title">Email Notifications</h3>
                    <p className="ecp-preference-desc">Receive order updates and promotional emails</p>
                  </div>
                  <label className="ecp-switch">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.emailNotifications}
                      onChange={(e) => handleInputChange('preferences', 'emailNotifications', e.target.checked)}
                    />
                    <span className="ecp-switch-slider"></span>
                  </label>
                </div>

                <div className="ecp-preference-item">
                  <div className="ecp-preference-info">
                    <h3 className="ecp-preference-title">SMS Notifications</h3>
                    <p className="ecp-preference-desc">Get shipping updates via text message</p>
                  </div>
                  <label className="ecp-switch">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.smsNotifications}
                      onChange={(e) => handleInputChange('preferences', 'smsNotifications', e.target.checked)}
                    />
                    <span className="ecp-switch-slider"></span>
                  </label>
                </div>

                <div className="ecp-preference-item">
                  <div className="ecp-preference-info">
                    <h3 className="ecp-preference-title">Newsletter</h3>
                    <p className="ecp-preference-desc">Subscribe to our weekly newsletter</p>
                  </div>
                  <label className="ecp-switch">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.newsletter}
                      onChange={(e) => handleInputChange('preferences', 'newsletter', e.target.checked)}
                    />
                    <span className="ecp-switch-slider"></span>
                  </label>
                </div>
              </div>

              <button onClick={handleSaveProfile} disabled={saving} className="ecp-btn ecp-btn-primary">
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Profilepage;