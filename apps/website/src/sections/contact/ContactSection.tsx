"use client";

import { Button, Card, CardContent, Input, Label, Textarea } from "@school/ui";
import {
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Tag,
  User,
} from "lucide-react";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  type ContactActionState,
  submitContact,
} from "@/app/(main)/contact/actions";
import { SectionWrapper } from "@/components/scaffolding/SectionWrapper";

import { cn } from "@/lib/utils";

const contactItems = [
  {
    icon: MapPin,
    title: "Address",
    color: "bg-red-50 text-red-600",
    content: (
      <>
        Brgy. Lual Pob.
        <br />
        Mauban, Quezon, 4330
      </>
    ),
  },
  {
    icon: Phone,
    title: "Phone",
    color: "bg-blue-50 text-blue-600",
    content: (
      <>
        <p>Main Office: (042) 731 9482</p>
        <p>Admission Office: (042) 731 9482</p>
      </>
    ),
  },
  {
    icon: Mail,
    title: "Email",
    color: "bg-emerald-50 text-emerald-600",
    content: (
      <>
        <p>motherperpetua_mauban@yahoo.com</p>
        <p>mppsregistrar@gmail.com</p>
      </>
    ),
  },
  {
    icon: Clock,
    title: "Office Hours",
    color: "bg-amber-50 text-amber-600",
    content: (
      <>
        <p>Mon - Fri: 7:30 AM - 4:00 PM</p>
      </>
    ),
  },
];

export function ContactSection() {
  const [state, formAction, isPending] = useActionState<
    ContactActionState,
    FormData
  >(submitContact, { status: "idle", messages: [] });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Message sent successfully! We'll get back to you soon.");
      formRef.current?.reset();
    } else if (state.status === "invalid_data") {
      toast.warning("Please check your inputs and try again.");
    } else if (state.status === "failed") {
      toast.error("Something went wrong. Please try again later.");
    }
  }, [state.status]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <SectionWrapper bg="background" width="7xl">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        {/* Left: Contact Info */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Get in <span className="text-red-600">Touch</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed max-w-md">
              Have questions about admissions or school life? We&apos;re here to
              help you every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {contactItems.map(({ icon: Icon, title, content, color }) => (
              <div
                className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-red-100 hover:shadow-lg hover:shadow-red-500/5"
                key={title}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                    color,
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{title}</h4>
                  <div className="mt-1 text-sm text-gray-500 leading-relaxed">
                    {content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden border-none shadow-2xl shadow-gray-200/50 ring-1 ring-gray-100">
            <CardContent className="p-0">
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-xl">
                  Send us a Message
                </h3>
                <p className="text-sm text-gray-500">
                  Required fields are marked with an asterisk (*)
                </p>
              </div>

              <form
                className="p-8 space-y-6"
                onSubmit={handleSubmit}
                ref={formRef}
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      className="text-sm font-bold text-gray-700"
                      htmlFor="name"
                    >
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        className="pl-10 h-12 rounded-xl border-gray-200 bg-white focus:ring-4 focus:ring-red-500/10 transition-all"
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      className="text-sm font-bold text-gray-700"
                      htmlFor="email"
                    >
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        className="pl-10 h-12 rounded-xl border-gray-200 bg-white focus:ring-4 focus:ring-red-500/10 transition-all"
                        id="email"
                        name="email"
                        placeholder="john@example.com"
                        required
                        type="email"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      className="text-sm font-bold text-gray-700"
                      htmlFor="phone"
                    >
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        className="pl-10 h-12 rounded-xl border-gray-200 bg-white focus:ring-4 focus:ring-red-500/10 transition-all"
                        id="phone"
                        name="phone"
                        placeholder="(042) 731-XXXX"
                        type="tel"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      className="text-sm font-bold text-gray-700"
                      htmlFor="subject"
                    >
                      Subject *
                    </Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        className="pl-10 h-12 rounded-xl border-gray-200 bg-white focus:ring-4 focus:ring-red-500/10 transition-all"
                        id="subject"
                        name="subject"
                        placeholder="Inquiry Topic"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    className="text-sm font-bold text-gray-700"
                    htmlFor="message"
                  >
                    Message *
                  </Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                    <Textarea
                      className="pl-10 pt-3 rounded-xl border-gray-200 bg-white focus:ring-4 focus:ring-red-500/10 transition-all resize-none"
                      id="message"
                      name="message"
                      placeholder="How can we help you today?"
                      required
                      rows={5}
                    />
                  </div>
                </div>

                <Button
                  className="w-full h-14 rounded-xl text-lg font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] disabled:opacity-70"
                  disabled={isPending}
                  type="submit"
                >
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    {isPending ? "Sending Message..." : "Send Message"}
                  </div>
                </Button>

                {state.status === "invalid_data" && state.messages && (
                  <div className="mt-4 rounded-xl bg-red-50 p-4">
                    <ul className="space-y-1 text-sm text-red-600">
                      {state.messages.map((msg: string, i: number) => (
                        <li className="flex items-center gap-2" key={i}>
                          <div className="h-1 w-1 rounded-full bg-red-600" />
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionWrapper>
  );
}
