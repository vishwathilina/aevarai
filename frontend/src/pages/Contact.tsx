import { Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Contact = () => {
    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12">
            <Card className="w-full max-w-md mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span className="font-medium">Nipun</span>
                        <a href="tel:+94713789763" className="ml-auto text-primary hover:underline">
                            +94 71378 9763
                        </a>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-primary" />
                        <span className="font-medium">Geemal</span>
                        <a href="tel:+94711625588" className="ml-auto text-primary hover:underline">
                            +94 7116 25588
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Contact;
