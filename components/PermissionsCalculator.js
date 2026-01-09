import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label, NormalLabel } from './ui/label';
import { permissions, permissionsCategories, calculatePermissions } from '../lib/permissions';
import { availableScopes } from '../lib/scopes';
import { getInviteUrl as getInviteUrlUtil } from '../lib/getInviteUrl';

export default function PermissionsCalculator() {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissionValue, setPermissionValue] = useState('0');
  const [clientId, setClientId] = useState('');
  const [botInfo, setBotInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [scopes, setScopes] = useState([]);
  const [requireCodeGrant, setRequireCodeGrant] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const value = calculatePermissions(selectedPermissions);
    setPermissionValue(value.toString());
  }, [selectedPermissions]);

  useEffect(() => {
    setBotInfo(null);
    setError('');
  }, [clientId]);

  const togglePermission = (permKey) => {
    if (permKey === 'ADMINISTRATOR') {
      if (!selectedPermissions.includes('ADMINISTRATOR')) {
        setSelectedPermissions(Object.keys(permissions));
      } else {
        setSelectedPermissions([]);
      }
    } else {
      setSelectedPermissions(prev => {
        if (prev.includes(permKey)) {
          return prev.filter(p => p !== permKey && p !== 'ADMINISTRATOR');
        } else {
          return [...prev, permKey];
        }
      });
    }
  };

  const selectAll = () => {
    setSelectedPermissions(Object.keys(permissions));
  };

  const toggleScope = (scope) => {
    setScopes(prev => {
      if (prev.includes(scope)) {
        return prev.filter(s => s !== scope);
      } else {
        return [...prev, scope];
      }
    });
  };

  const clearAll = () => {
    setSelectedPermissions([]);
  };

  const toggleCategory = (categoryPermissions) => {
    const allSelected = categoryPermissions.every(permKey => selectedPermissions.includes(permKey));
    if (allSelected) {
      setSelectedPermissions(selectedPermissions.filter(permKey => !categoryPermissions.includes(permKey)));
    } else {
      setSelectedPermissions([
        ...selectedPermissions,
        ...categoryPermissions.filter(permKey => !selectedPermissions.includes(permKey))
      ]);
    }
  };

  const fetchBotInfo = async () => {
    if (!clientId.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bot-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientId.trim() })
      });
      if (!res.ok) throw new Error('Failed to fetch bot info');
      const data = await res.json();
      setBotInfo(data);
    } catch (err) {
      setError('Could not fetch bot info. Make sure the Client ID is correct.');
    } finally {
      setLoading(false);
    }
  };

  const getInviteUrl = () => {
    return getInviteUrlUtil({
      clientId,
      permissions: permissionValue,
      scopes,
      redirectUri,
      requireCodeGrant
    });
  };

  const copyInviteUrl = () => {
    navigator.clipboard.writeText(getInviteUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const allPermissionsSelected = Object.keys(permissions).every(permKey => selectedPermissions.includes(permKey));

  return (
  <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 mt-0 pt-0" style={{marginTop: 0, paddingTop: 0}}>
      <Card className="p-6 md:p-8 shadow-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
        <div>
          <NormalLabel className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 tracking-wide">
            Client ID
          </NormalLabel>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Insert Client ID here"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchBotInfo(); } }}
              className="flex-1"
            />
            <Button 
              onClick={fetchBotInfo} 
              disabled={loading}
              className="h-11 px-6 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 disabled:bg-gray-400 font-semibold whitespace-nowrap text-white sm:flex-shrink-0"
            >
              {loading ? 'Fetching...' : 'Fetch Bot Info'}
            </Button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          )}
          {botInfo && (
            <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-700 shadow-lg">
              <div className="flex items-start gap-4">
                {botInfo.icon && (
                  <img
                    src={botInfo.icon}
                    alt={botInfo.name}
                    className="w-16 h-16 rounded-xl shadow-md border-2 border-slate-300 dark:border-slate-700"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {botInfo.name}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-mono mt-1 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded inline-block">
                    ID: {botInfo.id}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      <Card className="p-6 md:p-8 shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Permission Categories
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Select the permissions you want to grant to your bot.
              </p>
            </div>
            <Button
              onClick={allPermissionsSelected ? clearAll : selectAll}
              className={`h-11 px-6 rounded-lg text-sm font-semibold transition-all
                ${allPermissionsSelected
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                  : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                }`}
            >
              {allPermissionsSelected ? 'Unselect All' : 'Select All'}
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {Object.entries(permissionsCategories).map(([categoryKey, category]) => {
              const allCategorySelected = category.permissions.every(permKey => selectedPermissions.includes(permKey));
              return (
                <div key={categoryKey} className="p-6 md:p-7 shadow-lg bg-gray-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-800 hover:shadow-xl transition-all rounded-xl">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`inline-block px-4 py-2 rounded-lg shadow-md`}>
                      <h2 className="text-lg font-bold text-white">
                        {category.name}
                      </h2>
                    </div>
                    <button
                      onClick={() => toggleCategory(category.permissions)}
                      className={`h-11 px-4 rounded-lg text-sm font-semibold transition-all ${
                        allCategorySelected
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                          : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                      }`}
                    >
                      {allCategorySelected ? 'Unselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {category.permissions.map(permKey => {
                      const perm = permissions[permKey];
                      if (!perm) return null;
                      const isSelected = selectedPermissions.includes(permKey);
                      const isAdminSelected = selectedPermissions.includes('ADMINISTRATOR');
                      const isDisabled = isAdminSelected && permKey !== 'ADMINISTRATOR';
                      return (
                        <div
                          key={permKey}
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-slate-500 bg-slate-100 dark:bg-slate-900'
                              : 'border-gray-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-slate-500'
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => !isDisabled && togglePermission(permKey)}
                        >
                          <div className="flex items-start">
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">{perm.name}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {perm.description}
                              </div>
                              {perm.requiresTwoFactor && (
                                <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
                                  Requires 2FA when used in servers with server-wide 2FA enabled.
                                </div>
                              )}
                              {permKey === 'ADMINISTRATOR' && (
                                <div className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded inline-block">
                                  Grants all permissions and bypasses channel overwrites
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
      <Card className="p-6 md:p-8 shadow-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                OAuth URL Generator
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Generate a Discord OAuth2 invite link for your bot with the selected permissions and options below.
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 tracking-wide">
                  Redirect URI:
                  <span className="text-gray-500 text-xs ml-2 normal-case">(optional)</span>
                </label>
                <Input
                  type="text"
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                  placeholder="https://example.com/callback"
                  className="w-full h-14 text-sm"
                />
              </div>
              <div>
                <NormalLabel className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 tracking-wide">
                  Options:
                </NormalLabel>
                <button
                  type="button"
                  onClick={() => setRequireCodeGrant(prev => !prev)}
                  className={`flex items-center justify-between w-full gap-3 p-4 rounded-lg border-2 text-sm font-medium transition-all
                    ${requireCodeGrant
                      ? 'bg-slate-100 dark:bg-gray-800 border-slate-400 dark:border-gray-500 text-gray-900 dark:text-gray-100'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-slate-400 dark:hover:border-slate-500'}
                  `}
                >
                  <span>Require Code Grant</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${requireCodeGrant
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                  >
                    {requireCodeGrant ? 'On' : 'Off'}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <NormalLabel className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 tracking-wide">
                Scopes:
              </NormalLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableScopes.map(scope => (
                  <div
                    key={scope.value}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      scopes.includes(scope.value)
                        ? 'border-slate-500 bg-slate-100 dark:bg-slate-900'
                        : 'border-gray-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                    onClick={() => toggleScope(scope.value)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          {scope.label}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {scope.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-5 dark:border-gray-700">
              <NormalLabel className="block text-sm font-semibold mb-3 text-indigo-900 dark:text-indigo-100 tracking-wide">
                Generated OAuth URL:
              </NormalLabel>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  value={getInviteUrl()}
                  readOnly
                  placeholder="Enter a Client ID to generate URL..."
                  className="font-mono text-xs"
                />
                <Button 
                  onClick={copyInviteUrl} 
                  className="h-11 px-6 bg-slate-700 hover:bg-slate-800 font-semibold"
                  disabled={!clientId.trim()}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
              {clientId.trim() && (
                <div className="mt-3">
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <div className="flex-1">
                      <Label className="w-full bg-slate-900 dark:bg-slate-900 text-white px-4 py-2 rounded shadow-none">
                        Permissions Value: <span className="font-mono font-bold">{permissionValue}</span>
                      </Label>
                    </div>
                    <div className="flex-1">
                      <Label className="w-full bg-slate-900 dark:bg-slate-900 text-white px-4 py-2 rounded shadow-none">
                        Scopes: <span className="font-mono font-bold">{scopes.join(', ') || 'None'}</span>
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </Card>
    </div>
  );
}