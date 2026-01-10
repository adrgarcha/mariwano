/** @jsx JSX.createElement */
/** @jsxFrag JSX.Fragment */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Builder, JSX, loadImage } from 'canvacord';

interface Props {
   username: string;
   avatar: string;
   level: number;
   currentXp: number;
   requiredXp: number;
   rank: number;
   status: 'online' | 'idle' | 'dnd' | 'offline';
   totalDonated: number;
   totalReceived: number;
   donationCount: number;
}

const STATUS_COLORS = {
   online: '#43b581',
   idle: '#faa61a',
   dnd: '#f04747',
   offline: '#747f8d',
};

export class ProfileCard extends Builder<Props> {
   constructor() {
      super(934, 282);
      this.bootstrap({
         username: '',
         avatar: '',
         level: 0,
         currentXp: 0,
         requiredXp: 0,
         rank: 0,
         status: 'offline',
         totalDonated: 0,
         totalReceived: 0,
         donationCount: 0,
      });
   }

   setUsername(value: string) {
      this.options.set('username', value);
      return this;
   }

   setAvatar(value: string) {
      this.options.set('avatar', value);
      return this;
   }

   setLevel(value: number) {
      this.options.set('level', value);
      return this;
   }

   setCurrentXp(value: number) {
      this.options.set('currentXp', value);
      return this;
   }

   setRequiredXp(value: number) {
      this.options.set('requiredXp', value);
      return this;
   }

   setRank(value: number) {
      this.options.set('rank', value);
      return this;
   }

   setStatus(value: Props['status']) {
      this.options.set('status', value);
      return this;
   }

   setTotalDonated(value: number) {
      this.options.set('totalDonated', value);
      return this;
   }

   setTotalReceived(value: number) {
      this.options.set('totalReceived', value);
      return this;
   }

   setDonationCount(value: number) {
      this.options.set('donationCount', value);
      return this;
   }

   async render() {
      const { username, avatar, level, currentXp, requiredXp, rank, status, totalDonated, totalReceived, donationCount } = this.options.getOptions();

      const avatarImage = await loadImage(avatar);
      const progressPercentage = Math.min((currentXp / requiredXp) * 100, 100);
      const statusColor = STATUS_COLORS[status];

      return (
         <div
            style={{
               display: 'flex',
               flexDirection: 'column',
               width: '100%',
               height: '100%',
               backgroundColor: '#23272A',
               borderRadius: '12px',
               padding: '16px',
            }}>
            <div style={{ display: 'flex', flex: 1, backgroundColor: '#2B2F35', borderRadius: '8px', padding: '16px' }}>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: '24px' }}>
                  <div style={{ display: 'flex', position: 'relative' }}>
                     <img src={avatarImage.toDataURL()} style={{ width: '128px', height: '128px', borderRadius: '50%' }} />
                     <div
                        style={{
                           display: 'flex',
                           position: 'absolute',
                           bottom: '4px',
                           right: '4px',
                           width: '32px',
                           height: '32px',
                           borderRadius: '50%',
                           backgroundColor: statusColor,
                           border: '4px solid #2B2F35',
                        }}
                     />
                  </div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>{username}</span>
                        <span style={{ color: '#9CA3AF', fontSize: '18px' }}>Puesto #{rank}</span>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ color: '#5865F2', fontSize: '24px', fontWeight: 'bold' }}>Nivel {level}</span>
                     </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#9CA3AF', fontSize: '14px' }}>XP</span>
                        <span style={{ color: '#9CA3AF', fontSize: '14px' }}>
                           {currentXp} / {requiredXp}
                        </span>
                     </div>
                     <div
                        style={{
                           display: 'flex',
                           width: '100%',
                           height: '20px',
                           backgroundColor: '#484B4E',
                           borderRadius: '10px',
                           overflow: 'hidden',
                        }}>
                        <div
                           style={{
                              display: 'flex',
                              height: '100%',
                              width: `${progressPercentage}%`,
                              backgroundColor: '#5865F2',
                              borderRadius: '10px',
                           }}
                        />
                     </div>
                  </div>

                  <div
                     style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '16px',
                        backgroundColor: '#1E2124',
                        borderRadius: '8px',
                        padding: '12px',
                     }}>
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ color: '#2ecc71', fontSize: '20px', fontWeight: 'bold' }}>{totalDonated}</span>
                        <span style={{ color: '#9CA3AF', fontSize: '12px' }}>💸 Donado</span>
                     </div>
                     <div style={{ display: 'flex', width: '1px', backgroundColor: '#4B5563', marginLeft: '8px', marginRight: '8px' }} />
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ color: '#f1c40f', fontSize: '20px', fontWeight: 'bold' }}>{totalReceived}</span>
                        <span style={{ color: '#9CA3AF', fontSize: '12px' }}>🎁 Recibido</span>
                     </div>
                     <div style={{ display: 'flex', width: '1px', backgroundColor: '#4B5563', marginLeft: '8px', marginRight: '8px' }} />
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ color: '#9b59b6', fontSize: '20px', fontWeight: 'bold' }}>{donationCount}</span>
                        <span style={{ color: '#9CA3AF', fontSize: '12px' }}>📊 Donaciones</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }
}
