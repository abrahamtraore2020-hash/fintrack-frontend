'use client'
import { useState } from 'react'
import { Bell, Plus, Mail, Smartphone, Globe, AppWindow } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { timeAgo } from '@/lib/utils'

const NOTIFS = [
  { id:'1', title:'Budget alimentation dépassé', body:'Vous avez dépensé 28% de vos revenus en alimentation ce mois-ci.', isRead:false, createdAt: new Date().toISOString(), type:'expense_threshold', icon:'⚠️', bg:'bg-yellow-50' },
  { id:'2', title:'Virement Wave reçu', body:'+150 000 FCFA reçus sur votre compte Wave.', isRead:false, createdAt: new Date(Date.now()-900000).toISOString(), type:'income_received', icon:'✅', bg:'bg-green-50' },
  { id:'3', title:'Coffre Vacances mis à jour', body:'5% de votre revenu a été alloué automatiquement (7 500 FCFA).', isRead:true, createdAt: new Date(Date.now()-86400000).toISOString(), type:'coffre_milestone', icon:'🗄️', bg:'bg-purple-50' },
]

const ALARMS = [
  { id:'1', name:'Seuil dépenses restaurant', desc:'Alerte si > 30 000 F/mois en restauration', isActive:true, icon:'💸', type:'expense_threshold' },
  { id:'2', name:'Rappel loyer', desc:'Chaque 28 du mois à 08h00', isActive:true, icon:'📅', type:'periodic_reminder' },
  { id:'3', name:'Solde bas', desc:'Alerte si solde tracké < 50 000 F', isActive:false, icon:'📉', type:'balance_low' },
  { id:'4', name:'Milestone Coffre Vacances', desc:'Notifie à 25%, 50%, 75% et 100%', isActive:true, icon:'🎯', type:'coffre_milestone' },
]

const CHANNELS = [
  { id:'email', label:'Email', icon:Mail, color:'text-blue-500', desc:'Résumé hebdo & instantané' },
  { id:'push_mobile', label:'Push mobile', icon:Smartphone, color:'text-green-500', desc:'iOS & Android temps réel' },
  { id:'web_push', label:'Web Push', icon:Globe, color:'text-purple-500', desc:'Navigateur sans app ouverte' },
  { id:'in_app', label:'In-app', icon:AppWindow, color:'text-yellow-600', desc:'Dans l\'application' },
]

export default function NotificationsPage() {
  const [alarms, setAlarms] = useState(ALARMS)
  const [channels, setChannels] = useState({ email:true, push_mobile:true, web_push:false, in_app:true })
  const [showModal, setShowModal] = useState(false)

  return (
    <AppLayout>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Alertes & <span className="text-glow-blue">Notifications</span></h1>
          <p className="text-sm text-gray-500">Gérez vos alarmes personnalisées et préférences de notification</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus size={15} /> Nouvelle alarme</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Notifications récentes */}
        <Card>
          <CardTitle><Bell size={16} className="text-gold" /> Notifications récentes</CardTitle>
          <div className="space-y-2.5">
            {NOTIFS.map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border ${n.isRead ? 'bg-white border-gray-100' : 'bg-yellow-50 border-yellow-100'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${n.bg}`}>{n.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800">{n.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Alarmes */}
        <Card>
          <CardTitle><Bell size={16} className="text-gold" /> Alarmes personnalisées</CardTitle>
          <div className="space-y-2.5">
            {alarms.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                <span className="text-base">{a.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800">{a.name}</p>
                  <p className="text-[11px] text-gray-400">{a.desc}</p>
                </div>
                <Toggle checked={a.isActive} onChange={v => setAlarms(alarms.map(al => al.id === a.id ? {...al, isActive:v} : al))} />
              </div>
            ))}
            <button onClick={() => setShowModal(true)} className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-gold hover:text-yellow-700 transition-colors flex items-center justify-center gap-2">
              <Plus size={14} /> Créer une alarme
            </button>
          </div>
        </Card>
      </div>

      {/* Canaux de notification */}
      <Card>
        <CardTitle><Bell size={16} className="text-gold" /> Canaux de notification</CardTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CHANNELS.map(c => {
            const Icon = c.icon
            const isOn = channels[c.id as keyof typeof channels]
            return (
              <div key={c.id} className={`p-4 rounded-xl border text-center transition-all ${isOn ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}>
                <Icon size={20} className={`${isOn ? c.color : 'text-gray-300'} mx-auto mb-2`} />
                <p className="text-xs font-semibold text-gray-700">{c.label}</p>
                <p className="text-[10px] text-gray-400 mb-3">{c.desc}</p>
                <Toggle checked={isOn} onChange={v => setChannels({...channels, [c.id]:v})} />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Modal nouvelle alarme */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvelle alarme personnalisée">
        <div className="space-y-4">
          <Input label="Nom de l'alarme" placeholder="Ex: Budget restaurant" />
          <Select label="Type d'alarme" options={[
            { value:'expense_threshold', label:'Seuil de dépense dépassé' },
            { value:'balance_low', label:'Solde bas' },
            { value:'periodic_reminder', label:'Rappel périodique' },
            { value:'coffre_milestone', label:'Jalon de coffre (25%, 50%...)' },
            { value:'income_received', label:'Revenu reçu' },
          ]} />
          <Input label="Valeur seuil (FCFA)" type="number" placeholder="30000" />
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Canaux de notification</p>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map(c => (
                <label key={c.id} className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" className="accent-yellow-400" defaultChecked={c.id !== 'web_push'} />
                  <span className="text-xs text-gray-600">{c.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button className="flex-1">Créer l'alarme</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
