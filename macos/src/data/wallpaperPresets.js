/** Shared desktop / Settings wallpaper presets (gradient or photo). */
export const wallpaperPresets = [
  {
    id: 'default-photo',
    name: 'Desk Photo',
    caption: 'Default desktop image',
    preview: {
      backgroundImage: "url('/wallpaper.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
  },
  {
    id: 'aurora-day',
    name: 'Aurora Day',
    caption: 'Bright layered glass',
    preview: {
      backgroundImage:
        'radial-gradient(circle at 24% 22%, rgba(255,255,255,0.72) 0 14%, transparent 24%), radial-gradient(circle at 77% 20%, rgba(120,214,255,0.48) 0 12%, transparent 24%), linear-gradient(135deg, #edf6ff 0%, #b7d1ff 30%, #6f9ae8 58%, #314d84 100%)',
    },
  },
  {
    id: 'coastal-dusk',
    name: 'Coastal Dusk',
    caption: 'Cool water and sky',
    preview: {
      backgroundImage:
        'radial-gradient(circle at 18% 76%, rgba(255,255,255,0.3) 0 12%, transparent 20%), radial-gradient(circle at 78% 18%, rgba(105,194,255,0.38) 0 16%, transparent 26%), linear-gradient(145deg, #0d1329 0%, #183763 34%, #2d6c96 62%, #8fbfd4 100%)',
    },
  },
  {
    id: 'glass-wave',
    name: 'Glass Wave',
    caption: 'Soft reflections',
    preview: {
      backgroundImage:
        'radial-gradient(circle at 50% 18%, rgba(255,255,255,0.6) 0 10%, transparent 22%), radial-gradient(circle at 18% 62%, rgba(64,226,219,0.45) 0 11%, transparent 24%), linear-gradient(140deg, #f6fbff 0%, #b7e6f4 28%, #6aa3d8 58%, #24538a 100%)',
    },
  },
  {
    id: 'redwood-night',
    name: 'Redwood Night',
    caption: 'Warm land and dark wood',
    preview: {
      backgroundImage:
        'radial-gradient(circle at 78% 22%, rgba(255,214,153,0.42) 0 11%, transparent 22%), radial-gradient(circle at 24% 24%, rgba(255,255,255,0.18) 0 10%, transparent 20%), linear-gradient(140deg, #120f18 0%, #3a2431 30%, #7a4a3f 58%, #c38d67 100%)',
    },
  },
  {
    id: 'tide-glow',
    name: 'Tide Glow',
    caption: 'Blue-green edge light',
    preview: {
      backgroundImage:
        'radial-gradient(circle at 76% 24%, rgba(255,255,255,0.44) 0 10%, transparent 22%), radial-gradient(circle at 22% 72%, rgba(72,255,214,0.38) 0 14%, transparent 28%), linear-gradient(140deg, #08111f 0%, #163b5c 32%, #0f7d8c 62%, #64d6c8 100%)',
    },
  },
  {
    id: 'sunrise-haze',
    name: 'Sunrise Haze',
    caption: 'Warm morning light',
    preview: {
      backgroundImage:
        'radial-gradient(circle at 22% 22%, rgba(255,255,255,0.58) 0 12%, transparent 22%), radial-gradient(circle at 78% 62%, rgba(255,255,255,0.22) 0 10%, transparent 20%), linear-gradient(145deg, #fff4df 0%, #ffc28f 32%, #ff8a73 64%, #8e4b7e 100%)',
    },
  },
  {
    id: 'pine-shadow',
    name: 'Pine Shadow',
    caption: 'Muted forest tone',
    preview: {
      backgroundImage:
        'radial-gradient(circle at 18% 18%, rgba(255,255,255,0.26) 0 10%, transparent 20%), radial-gradient(circle at 70% 70%, rgba(128,223,170,0.4) 0 11%, transparent 24%), linear-gradient(140deg, #0c1612 0%, #123225 34%, #295540 62%, #88b99a 100%)',
    },
  },
  {
    id: 'midnight-frost',
    name: 'Midnight Frost',
    caption: 'Cool neutral glass',
    preview: {
      backgroundImage:
        'radial-gradient(circle at 50% 22%, rgba(255,255,255,0.48) 0 11%, transparent 23%), radial-gradient(circle at 20% 66%, rgba(149,207,255,0.36) 0 12%, transparent 24%), linear-gradient(145deg, #f2f7ff 0%, #9cb3d4 28%, #5b6f94 58%, #1c2436 100%)',
    },
  },
];
