import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Skull, Phone, Anchor, Map, Home } from 'lucide-react';

const ClosingRegister = () => {
    const navigate = useNavigate();

    const contacts = [
        { name: 'Bala', phone: '9392894244' },
        { name: 'Harsha', phone: '7671084221' },
        { name: 'Jayanth', phone: '8309981858' },
        { name: 'Bhuvan', phone: '6360725752' },
        { name: 'Deepika', phone: '6301955275' }
    ];

    return (
        <div className="min-h-screen bg-pirate-ocean relative overflow-hidden font-body selection:bg-pirate-red/30 text-pirate-parchment flex flex-col items-center justify-center p-4">
            {/* Atmosphere layers */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>

            <div className="relative z-10 max-w-4xl w-full text-center">

                {/* Header Section */}
                <div className="mb-12 animate-fade-in-down">
                    <Skull className="w-24 h-24 text-pirate-red mx-auto mb-6 opacity-90 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                    <h1 className="text-6xl md:text-8xl font-pirate text-pirate-gold mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-widest uppercase">
                        Slots Full
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-pirate-parchment/60 mb-8">
                        <span className="h-[1px] w-24 bg-pirate-gold/30"></span>
                        <p className="text-xl uppercase tracking-[0.3em] font-bold text-pirate-wood-light/80">Registration Closed</p>
                        <span className="h-[1px] w-24 bg-pirate-gold/30"></span>
                    </div>
                    <p className="text-2xl md:text-3xl font-body text-pirate-parchment max-w-2xl mx-auto leading-relaxed">
                        The ship has reached capacity, matey. All slots have been filled for this adventure.
                    </p>
                </div>

                {/* Contact Section - Quartermaster's Log */}
                <div className="bg-pirate-wood-light/90 backdrop-blur-sm border-4 border-pirate-wood rounded-lg p-8 md:p-12 shadow-2xl relative max-w-3xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-10 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="border-b-2 border-pirate-wood/20 pb-6 mb-8">
                            <h2 className="text-3xl font-pirate text-pirate-wood mb-2">Quartermasters</h2>
                            <p className="text-pirate-wood/70 italic">Need assistance? Contact the crew.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {contacts.map((contact, index) => (
                                <div key={index} className="group bg-pirate-parchment/80 p-4 rounded border border-pirate-wood/10 hover:border-pirate-gold/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-pirate-wood/10 rounded-full group-hover:bg-pirate-gold/20 transition-colors">
                                                <Map className="w-5 h-5 text-pirate-wood group-hover:text-pirate-gold-hover" />
                                            </div>
                                            <span className="font-bold text-pirate-wood text-lg tracking-wide">{contact.name}</span>
                                        </div>
                                        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-pirate-ocean font-mono font-bold hover:text-pirate-red transition-colors">
                                            <Phone className="w-4 h-4" />
                                            {contact.phone}
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Return Home Button */}
                <div className="mt-12">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-3 bg-pirate-wood border-2 border-pirate-gold text-pirate-gold font-pirate text-2xl py-3 px-8 rounded hover:bg-pirate-gold hover:text-pirate-wood transition-all duration-300 shadow-lg group"
                    >
                        <Home className="w-6 h-6 group-hover:animate-bounce" />
                        Return to Port
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ClosingRegister;
